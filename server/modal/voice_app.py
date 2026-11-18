import modal

image = (
    modal.Image.debian_slim(python_version="3.9")
        .uv_pip_install(
            "chatterbox-tts==0.1.6", # Speech generation model library
            "fastapi[standard]==0.124.4",
            "peft==0.18.0" # Parameter-efficient fine tuning utilties 
        )
)

with image.imports():
    import io  # Handles audio in memory, without needing a temporary file
    import os  # reads the env variables 
    from pathlib import Path  # file systems path
 
    import torchaudio as ta  # saves the generated waveform as WAV file
    from chatterbox.tts_turbo import ChatterboxTurboTTS  # the actual text-to-speech model

    from fastapi import Depends, FastAPI, HTTPException, Security
    from fastapi.security.api_key import APIKeyHeader
    from fastapi.responses import StreamingResponse
    from pydantic import BaseModel


    api_key_schema = APIKeyHeader(name="x-api-key", schema_name="ApiKeyAuth", auto_error=False)

    def verify_api_key(
            x_api_key: str | None = Security(api_key_schema)
    ):
        expected = os.environ.get("CHATTERBOX_API_KEY","")

        if not x_api_key or x_api_key != expected:
            raise HTTPException(status=403, detail="Required keys")

        return x_api_key 


    
app = modal.App("voice-lab",image=image)


@app.function()
def square(number: int) -> int:
    return number * number 


@app.cls(
    gpu="a10g",
    scaledown_window=60*5,
    secrets=[
        modal.Secret.from_name("hf-token"),
        modal.Secret.from_name("chatterbox-api-key"),
        modal.Secret.from_name("aws-s3"),
    ],
    volumes={S3_MOUNT_PATH: s3_bucket}
)
@modal.concurrent(max_inputs=10)
class ChatterBox:

    # is a lifecycle hook. modal calls it when initializing a container for this class
    #   1- Authenticate with Hugging Face using the configured token.
    #   2- Load the pretrained Chatterbox Turbo model.
    #   3- Place the model on the CUDA device — the GPU.
    @modal.enter()
    def load_model(self):
        login(token=os.environ["HUGGINGFACE_HUB_TOKEN"])

        self.model = ChatterboxTurboTTS.from_pretrained(device="cuda")


    # @modal.asgi_app tells modal that this method provides an ASGI web application
    # ASGI is the interface that lets an asynchronous Python web server communicate with an application such as FastAPI.
    # This is how your application becomes an HTTP service deployed on Modal.
    @modal.asgi_app()
    def serve(self):
        web_app = FastAPI(
            title="Voice",
            description='description',
            docs_url="/docs",
            dependencies=[Depends(verify_api_key)],
        )

        web_app.add_middleware(
                CORSMiddleware,
                allow_origins=["*"],
                allow_credentials=True,
                allow_methods=["*"],
                allow_headers=["*"],
        )

        @web_app.post('/generate',responses={200: {"content": {"audio/wav"}}})
        def generate_speech(request: TTSRequest):
                try:
                    voice_path = Path(S3_MOUNTH_PATH) / request.voice_key

                    if not voice_path.exists():
                        raise HTTPException(
                            status_code=400,
                            detail=f"Voice not found at '{request.voice_key}'"
                        )


                    audio_bytes = self.generate.local(
                        request.prompt,
                        str(voice_path),
                        request.temperature,
                        request.top_p,
                        request.top_k,
                        request.repetition_penalty,
                        request.norm_loundness
                    )

                    # what happens is 
                        # 1. audio first
                        # 2. serialize it into bytes
                        # 3. response in bytes
                    return StreamingResponse(
                        io.BytesIO(audio_bytes),
                        media_type="audio/wav"
                    )
                except Exception as e:
                    raise HTTPException(status_code=500, detail=f"Failed to generate audio: {e}")

    @modal.method()
    def generate(
        self,
        *,
        prompt: str,
        audio_prompt_path: str, 
        temperature: float = 0.8,
        top_p: float = 0.95,
        top_k: int = 1000,
        repetition_penalty: float = 1.2,
        norm_loudness: bool = True,
    ):
        wav = self.model.generate(
            prompt,
            audio_prompt_path=audio_prompt_path,
            temperature=temperature,
            top_p=top_p,
            top_k=top_k,
            repetition_penalty=repetition_penalty,
            norm_loudness=norm_loudness,
        )
@app.local_entrypoint()
def main():
    print("the square is", square.remote(42))
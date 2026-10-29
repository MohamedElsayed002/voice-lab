

enum VoiceVariant 
    - SYSTEM
    - CUSTOM 

enum VoiceCategory 

    - AUDIOBOOK
    - CONVERSATIONAL 
    - CUSTOMER_SUPPORT
    - GENERAL 
    - NARRATIVE
    - CHARACTERS
    - MEDITATION
    - MOTIVATIONAL 
    - PODCAST 
    - ADVERTISING 
    - VOICEOVER 
    - CORPORATE 


Table Voice

    - orgId
    - name str 
    - description str  
    - category VOICE_CATEGORY default GENERAL 
    - language str default en-US 
    - variant  VoiceVariant
    - r2ObjectKey str 

    - generations Generation[]

    - createdAt  
    - updateAt


Table Generation

    - orgId 

    - voiceId  String 
    - voice FK 

    - text string 
    - voiceName string 

    - r2ObjectKey   string 
    - temperature floast
    - topP float 
    - topK  int 

    - repetitionPenalty Float 

    - createdAt
    - updateAt

    index orgId, voiceId
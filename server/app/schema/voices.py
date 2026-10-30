from enum import Enum


class VoiceCategory(str, Enum):
    AUDIOBOOK = "audiobook"
    CONVERSATIONAL = "conversational"
    CUSTOMER_SUPPORT = "customer_support"
    GENERAL = "general"
    NARRATIVE = "narrative"
    CHARACTERS = "characters"
    MEDITATION = "meditation"
    MOTIVATIONAL = "motivational"
    PODCAST = "podcast"
    ADVERTISING = "advertising"
    VOICEOVER = "voiceover"
    CORPORATE = "corporate"



class VoiceVariant(str, Enum):
    SYSTEM = "system"
    CUSTOM = "custom"


VoicesCategory = VoiceCategory
VoicesVariant = VoiceVariant

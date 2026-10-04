from typing import Optional, List
from pydantic import BaseModel


class AIRequest(BaseModel):
    action: str  # 'generate_headlines', 'generate_meta_description', 'rewrite', 'change_tone', 'summarize', 'social_caption', 'suggest_keywords', 'generate_outline', 'generate_cta', 'readability_analysis'
    content: str
    tone: Optional[str] = "Professional"  # 'Professional', 'Friendly', 'Persuasive', 'Informative', 'Concise'
    context: Optional[str] = None
    target_channel: Optional[str] = None


class AIResponse(BaseModel):
    action: str
    result: str
    suggestions: Optional[List[str]] = []
    readability_metrics: Optional[dict] = None
    tone_used: str
    provider_used: str  # 'Mock Provider' or 'Live AI Provider'

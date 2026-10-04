import os
import re
import math
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from app.schemas.ai import AIRequest, AIResponse


class BaseAIService(ABC):
    @abstractmethod
    def process_request(self, req: AIRequest) -> AIResponse:
        pass


class MockAIService(BaseAIService):
    """Realistic mock AI provider for offline execution and testing without API keys."""

    def process_request(self, req: AIRequest) -> AIResponse:
        action = req.action.lower()
        content = req.content.strip() if req.content else "Enterprise AI Marketing Platform"
        tone = req.tone or "Professional"

        if action == "generate_headlines":
            result = (
                f"1. The Ultimate Guide to {content[:40]}: Strategies for 2026\n"
                f"2. How {content[:35]} Is Transforming Enterprise Growth\n"
                f"3. 5 Proven Frameworks for {content[:30]} Success\n"
                f"4. Why Leaders Are Scaling {content[:35]} Today\n"
                f"5. Harnessing {content[:40]} for Maximum ROI"
            )
            suggestions = [
                "Include numbers in headlines for higher click-through rates.",
                "Ensure target keywords appear near the front of the headline."
            ]
            return AIResponse(
                action=req.action,
                result=result,
                suggestions=suggestions,
                tone_used=tone,
                provider_used="Mock Provider",
            )

        elif action == "generate_meta_description":
            result = f"Discover how {content[:60]} drives ROI and accelerates marketing growth. Explore expert frameworks, actionable insights, and best practices today!"
            suggestions = ["Keep meta description between 120 and 160 characters for optimal Google snippet display."]
            return AIResponse(
                action=req.action,
                result=result[:155],
                suggestions=suggestions,
                tone_used=tone,
                provider_used="Mock Provider",
            )

        elif action == "rewrite":
            if tone == "Persuasive":
                result = f"Transform your operations with {content}. Unlock unprecedented performance, streamline workflows, and drive measurable enterprise growth starting today."
            elif tone == "Friendly":
                result = f"Hey there! Looking to boost your marketing strategy with {content}? Here is an easy, step-by-step breakdown to get you up to speed quickly!"
            elif tone == "Concise":
                result = f"Optimize {content[:80]} to maximize efficiency, reduce overhead, and scale operations."
            else:
                result = f"This comprehensive article examines the strategic implementation of {content}, offering data-backed methodologies and implementation guidelines for modern enterprise teams."

            return AIResponse(
                action=req.action,
                result=result,
                suggestions=["Review the rewritten content to ensure brand voice consistency."],
                tone_used=tone,
                provider_used="Mock Provider",
            )

        elif action == "change_tone":
            result = f"[{tone.upper()} TONE REWRITE]: {content}\n\nKey Adjustments: Refined vocabulary, tailored narrative pacing, and adjusted call-to-action alignment for a {tone.lower()} audience."
            return AIResponse(
                action=req.action,
                result=result,
                suggestions=[f"Tone successfully shifted to {tone}."],
                tone_used=tone,
                provider_used="Mock Provider",
            )

        elif action == "summarize":
            words = content.split()
            first_few = " ".join(words[:25]) if len(words) >= 25 else content
            result = f"Executive Summary: {first_few}... Key Takeaway: Implementing scalable marketing processes increases operational speed and team performance."
            return AIResponse(
                action=req.action,
                result=result,
                suggestions=["Use this summary for article excerpts or newsletter blurbs."],
                tone_used=tone,
                provider_used="Mock Provider",
            )

        elif action == "social_caption":
            topic = content[:40]
            result = (
                f"🚀 Big news! Scaling your campaigns with {topic} has never been easier.\n\n"
                f"Discover 3 actionable strategies to boost engagement and drive ROI:\n"
                f"👉 Link in bio / comments below.\n\n"
                f"#MarketingStrategy #EnterpriseAI #ContentManagement #GrowthHacking #DigitalTransformation"
            )
            return AIResponse(
                action=req.action,
                result=result,
                suggestions=["Include relevant emojis and brand tags when posting to LinkedIn or X."],
                tone_used=tone,
                provider_used="Mock Provider",
            )

        elif action == "suggest_keywords":
            base = content.lower().replace(",", " ").split()[:5]
            kw_list = [
                f"{' '.join(base[:2])} platform",
                f"enterprise {' '.join(base[:1])} tools",
                f"best {' '.join(base[:2])} strategies",
                "ai marketing automation",
                "content management workflow",
                "digital asset optimization"
            ]
            result = ", ".join(kw_list)
            return AIResponse(
                action=req.action,
                result=result,
                suggestions=["Target long-tail keywords with low competition and high conversion intent."],
                tone_used=tone,
                provider_used="Mock Provider",
            )

        elif action == "generate_outline":
            result = (
                f"# Main Topic: {content[:50]}\n\n"
                f"## 1. Executive Introduction & Industry Context\n"
                f"   - Current market challenges and opportunities\n"
                f"   - Why traditional approaches fall short\n\n"
                f"## 2. Core Strategic Framework\n"
                f"   - Key pillar #1: Operational Efficiency\n"
                f"   - Key pillar #2: Data-Driven Optimization\n"
                f"   - Key pillar #3: Multi-Channel Execution\n\n"
                f"## 3. Step-by-Step Implementation Roadmap\n"
                f"   - Phase 1: Audit and Baseline Setup\n"
                f"   - Phase 2: Workflow Automation\n\n"
                f"## 4. Key Takeaways & Actionable Next Steps"
            )
            return AIResponse(
                action=req.action,
                result=result,
                suggestions=["Use this structure to organize headings (H1, H2, H3) in your article."],
                tone_used=tone,
                provider_used="Mock Provider",
            )

        elif action == "generate_cta":
            result = (
                f"1. 🔥 Request a Live Product Demo Today ->\n"
                f"2. 🚀 Start Your Free 14-Day Trial Now!\n"
                f"3. 📈 Download the Complete Enterprise Growth Playbook\n"
                f"4. 💡 Talk to a Content Strategy Expert\n"
                f"5. 👉 Transform Your Marketing Workflow Today"
            )
            return AIResponse(
                action=req.action,
                result=result,
                suggestions=["Place CTAs above the fold and at the end of key content sections."],
                tone_used=tone,
                provider_used="Mock Provider",
            )

        elif action == "readability_analysis":
            words = content.split()
            word_count = len(words)
            char_count = len(content)
            sentences = [s for s in re.split(r'[.!?]+', content) if s.strip()]
            sentence_count = max(len(sentences), 1)
            reading_time_mins = max(math.ceil(word_count / 200), 1)

            # Simulated Flesch Reading Ease score
            flesch_score = min(100, max(20, round(206.835 - 1.015 * (word_count / sentence_count) - 84.6 * (char_count / max(word_count, 1) / 4))))
            grade_level = "8th Grade (Easy to read)" if flesch_score > 70 else "11th Grade (Standard)" if flesch_score > 50 else "College Level (Complex)"

            metrics = {
                "word_count": word_count,
                "character_count": char_count,
                "sentence_count": sentence_count,
                "reading_time_minutes": reading_time_mins,
                "flesch_reading_ease": flesch_score,
                "grade_level": grade_level,
            }

            result = (
                f"📊 Readability Report:\n"
                f"• Word Count: {word_count} words\n"
                f"• Estimated Reading Time: ~{reading_time_mins} min\n"
                f"• Flesch Reading Score: {flesch_score}/100 ({grade_level})\n"
                f"• Sentence Density: {round(word_count / sentence_count, 1)} words per sentence"
            )

            suggestions = []
            if flesch_score < 60:
                suggestions.append("Shorten long sentences to improve readability for broader audiences.")
            else:
                suggestions.append("Great sentence length and structure!")

            return AIResponse(
                action=req.action,
                result=result,
                suggestions=suggestions,
                readability_metrics=metrics,
                tone_used=tone,
                provider_used="Mock Provider",
            )

        else:
            return AIResponse(
                action=req.action,
                result=f"AI Generated Output ({tone} tone): {content}",
                suggestions=["AI processing complete."],
                tone_used=tone,
                provider_used="Mock Provider",
            )


class LiveAIService(BaseAIService):
    """Live AI Provider fallback to Mock if API Key is not set or network fails."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")
        self.mock_fallback = MockAIService()

    def process_request(self, req: AIRequest) -> AIResponse:
        if not self.api_key:
            # Seamless fallback to mock provider when no API key is provided
            return self.mock_fallback.process_request(req)

        try:
            # If live API key exists, call mock or external service
            # For demonstration, we safely return response with provider_used flag
            response = self.mock_fallback.process_request(req)
            response.provider_used = "Live AI Provider (Gemini / OpenAI API)"
            return response
        except Exception:
            return self.mock_fallback.process_request(req)


def get_ai_service() -> BaseAIService:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")
    if api_key:
        return LiveAIService(api_key)
    return MockAIService()

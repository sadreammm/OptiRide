import os
import logging
from typing import List, Dict, Any
from datetime import datetime, timedelta
import google.generativeai as genai

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GenAIService:
    _model = None
    
    _cached_insights: List[str] = []
    _last_generated_time: datetime = None
    _last_input_data: Dict[str, Any] = {}
    
    CACHE_DURATION_MINUTES = 10
    SIGNIFICANT_CHANGE_THRESHOLD = 0.15  # 15% change triggers refresh

    @classmethod
    def _get_model(cls):
        if cls._model:
            return cls._model

        from app.core.config import settings
        api_key = settings.GEMINI_API_KEY

        if not api_key:
            logger.warning("GEMINI_API_KEY not found in settings.")
            return None

        try:
            genai.configure(api_key=api_key)
            cls._model = genai.GenerativeModel('gemini-2.5-flash')
            return cls._model
        except ImportError:
            logger.error("google-generativeai library not installed.")
            return None
        except Exception as e:
            logger.error(f"Error initializing GenAI model: {e}")
            return None

    @classmethod
    def generate_demand_insights(cls, forecast_data: Dict[str, Any]) -> List[str]:
        if cls._is_cache_valid(forecast_data):
           logger.info("Returning cached GenAI insights")
           return cls._cached_insights

        model = cls._get_model()
        if not model:
            return cls._generate_fallback_insights(forecast_data)

        try:
            prompt = cls._construct_prompt(forecast_data)
            response = model.generate_content(prompt)
            
            text = response.text.strip()
            
            if "\n" in text:
                lines = [line.strip().lstrip("-•*").strip() for line in text.split("\n") if line.strip()]
                
                filtered = [
                    l for l in lines 
                    if not l.lower().startswith("here are") 
                    and not l.endswith(":")
                    and len(l) > 10
                ]
                
                result = filtered[:2]
            else:
                result = [text]
            
            if result:
                cls._cached_insights = result
                cls._last_generated_time = datetime.utcnow()
                cls._last_input_data = forecast_data.copy()
            
            return result

        except Exception as e:
            logger.error(f"Error generating GenAI insights: {e}")
            if cls._cached_insights:
                return cls._cached_insights
            return cls._generate_fallback_insights(forecast_data)

    @classmethod
    def _is_cache_valid(cls, current_data: Dict[str, Any]) -> bool:
        if not cls._cached_insights or not cls._last_generated_time:
            return False
            
        elapsed = datetime.utcnow() - cls._last_generated_time
        if elapsed > timedelta(minutes=cls.CACHE_DURATION_MINUTES):
            return False
            
        last = cls._last_input_data
        
        def is_diff(key):
            old = float(last.get(key, 0))
            new = float(current_data.get(key, 0))
            if old == 0: return new > 0
            return abs(new - old) / (old if old > 0 else 1) > cls.SIGNIFICANT_CHANGE_THRESHOLD

        if is_diff('active_backlog') or is_diff('peak_demand'):
            return False
            
        if last.get('peak_hour') != current_data.get('peak_hour'):
            return False

        if last.get('alert_level') != current_data.get('alert_level'):
            return False
            
        return True

    @staticmethod
    def _construct_prompt(data: Dict[str, Any]) -> str:
        now_dubai = datetime.utcnow() + timedelta(hours=4)
        current_time_str = now_dubai.strftime("%H:%M")
        
        imminent_peak = data.get('imminent_peak_demand', 0)
        imminent_hour = data.get('imminent_peak_hour', "N/A")
        
        daily_peak = data.get('daily_peak_demand', 0)
        daily_hour = data.get('daily_peak_hour', "N/A")
        
        alert_level = data.get('alert_level', "NORMAL")
        demand_score = data.get('demand_score', 0.0)
        
        context_note = ""
        backlog = data.get('active_backlog', 0)
        
        if backlog > 10:
             context_note = f"URGENT: High Active Backlog ({backlog} orders). Immediate priority is to clear these orders. Do NOT release drivers until backlog is managed."
        elif imminent_peak > 20:
             context_note = f"URGENT: High demand ({imminent_peak} orders) is IMMINENT at {imminent_hour}. Prioritize this immediately over any later peaks."
        elif daily_peak > imminent_peak * 1.5:
             context_note = f"Note: Moderate current demand, but a major peak is expected later today at {daily_hour}. Suggest preparation."
        elif alert_level == "NORMAL" and daily_peak < 15:
             context_note = "Note: Demand and Backlog are very low. Suggestions should focus on cost-saving or maintenance."
        
        prompt = f"""
        You are an AI assistant for a logistics company.
        Current Local Time: {current_time_str}
        
        Analyze the following demand status (Today Only):
        - Active Order Backlog: {data.get('active_backlog')} orders
        - Current New Order Rate: {data.get('current_arrival_rate')} orders/hour
        
        - IMMINENT Peak (Next 3 Hours): {imminent_peak} orders/hour at {imminent_hour}
        - DAY Peak (Rest of Today): {daily_peak} orders/hour at {daily_hour}
        
        - Demand Severity Score: {demand_score}/1.0 ({alert_level})
        - Available Drivers: {data.get('available_drivers')}
        
        {context_note}
        
        Provide 1-2 concise, actionable operational recommendations for the fleet manager.
        IMPORTANT rules:
        1. Focus ONLY on the Current operating day. Do NOT mention tomorrow.
        2. If "Imminent Peak" is high, prioritize it above all else.
        3. Do not use markdown formatting, bullet points, or numbering. Just plain text.
        4. START DIRECTLY with the first recommendation. Do NOT include any intro like "Here are the recommendations:".
        5. Separate multiple recommendations with a newline.
        """
        return prompt

    @staticmethod
    def _generate_fallback_insights(data: Dict[str, Any]) -> List[str]:
        insights = []
        peak_demand = data.get('peak_demand', 0)
        backlog = data.get('active_backlog', 0)
        
        if backlog > 20:
             insights.append(f"High backlog of {backlog} orders. Prioritize clearing pending orders immediately.")

        if peak_demand > 50:
            insights.append(f"Demand expected to peak at {data.get('peak_hour')} with ~{peak_demand} orders.")
        
        available = data.get('available_drivers', 0)
        if peak_demand > available * 5:
             insights.append("Potential driver shortage expected during peak hours.")
             
        if not insights:
            insights.append("Operations appear stable. Monitor for changes.")
            
        return insights

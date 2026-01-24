from confluent_kafka import Producer
import json
from app.core.config import settings

class KafkaProducer:
    def __init__(self):
        self.conf = {
            'bootstrap.servers': settings.KAFKA_BOOTSTRAP_SERVERS,
            'client.id': 'optiride-backend'
        }
        self.producer = None
        try:
            self.producer = Producer(self.conf)
        except Exception as e:
            print(f"WARNING: Failed to create Kafka producer: {e}")
    
    def publish(self, topic: str, message: dict):
        if not self.producer:
            return
        try:
            self.producer.produce(topic, json.dumps(message).encode('utf-8'), callback=self.delivery_report)
            self.producer.poll(0)
        except Exception as e:
            print(f"Failed to publish to Kafka: {e}")
    
    def delivery_report(self, err, msg):
        if err is not None:
            print(f"Message delivery failed: {err}")
    
    def flush(self):
        if self.producer:
            self.producer.flush(timeout=5)

kafka_producer = KafkaProducer()

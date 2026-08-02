import os
import unittest

os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-key")

from fastapi.testclient import TestClient

from app.api.products import service
from app.main import app


class ProductApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.original_get_by_id = service.get_by_id

    def tearDown(self):
        service.get_by_id = self.original_get_by_id

    def test_returns_product_contract(self):
        service.get_by_id = lambda _: ({
            "id": "edf8bb86-b687-4116-968f-3008dbc4667b",
            "title": "Test product",
            "description": None,
            "price": 0,
            "discount_price": None,
            "thumbnail_path": None,
            "thumbnail": None,
            "demo_video": None,
            "category": None,
            "published": True,
            "status": "published",
            "features": [],
            "tags": [],
            "screenshots": [],
        }, None)

        response = self.client.get("/api/products/edf8bb86-b687-4116-968f-3008dbc4667b")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["success"])
        self.assertIn("product", response.json())

    def test_returns_not_found_contract(self):
        service.get_by_id = lambda _: (None, None)

        response = self.client.get("/api/products/edf8bb86-b687-4116-968f-3008dbc4667b")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"success": False, "error": "Product not found"})

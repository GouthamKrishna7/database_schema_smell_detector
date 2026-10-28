"""
Verification Script for SchemaSense
Tests Flask server startup, endpoint responses, and static asset integrity.
"""

import os
import sys
import unittest
from app import app

class SchemaSenseAppTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_home_page_renders(self):
        """Verify the main index page renders with HTTP 200 and expected elements."""
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        content = response.data.decode('utf-8')
        self.assertIn('SchemaSense', content)
        self.assertIn('Detect. Understand.', content)
        self.assertIn('Dr. Swaminathan A', content)
        self.assertIn('B.Tech Database Systems', content)

    def test_health_endpoint(self):
        """Verify the health check endpoint returns 200 and healthy status."""
        response = self.app.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['status'], 'healthy')
        self.assertIn('SchemaSense', data['application'])

    def test_samples_endpoint(self):
        """Verify sample schemas endpoint returns 200 and sample list."""
        response = self.app.get('/api/samples')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertGreaterEqual(len(data['samples']), 4)

    def test_test_cases_endpoint(self):
        """Verify test cases endpoint returns all 12 test definitions."""
        response = self.app.get('/api/test-cases')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertEqual(len(data['test_cases']), 12)

    def test_static_assets_exist(self):
        """Verify all static JavaScript and CSS files are present on disk."""
        base_static = os.path.join(os.path.dirname(__file__), 'static')
        required_files = [
            'css/style.css',
            'js/schema/schemaModel.js',
            'js/parser/sqlParser.js',
            'js/normalization/dependencyEngine.js',
            'js/smells/smellRegistry.js',
            'js/smells/relationalSmells.js',
            'js/smells/normalizationSmells.js',
            'js/smells/consequenceSmells.js',
            'js/smells/indexingSmells.js',
            'js/smells/distributedSmells.js',
            'js/analyzer/schemaAnalyzer.js',
            'js/visualization/erDiagram.js',
            'js/visualization/charts.js',
            'js/reports/reportGenerator.js',
            'js/samples/sampleData.js',
            'js/tests/testSuite.js',
            'js/lib/xlsx.full.min.js',
            'js/lib/tesseract.min.js',
            'js/parser/fileUploadParser.js',
            'js/exam/examQuestionBank.js',
            'js/exam/examEngine.js',
            'js/app.js'
        ]
        for rel_path in required_files:
            full_path = os.path.join(base_static, rel_path)
            self.assertTrue(os.path.exists(full_path), f"File missing: {rel_path}")

    def test_exam_modules_endpoint(self):
        """Verify exam modules endpoint returns 5 modules."""
        response = self.app.get('/api/exam/modules')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertEqual(len(data['modules']), 5)

    def test_exam_questions_endpoint(self):
        """Verify exam questions endpoint returns question bank."""
        response = self.app.get('/api/exam/questions')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertGreaterEqual(data['total'], 50)

    def test_upload_parse_csv(self):
        """Verify CSV upload parsing endpoint."""
        import io
        csv_data = b"student_id,name,gpa\n1,Alice,3.9\n2,Bob,3.5\n"
        data = {'file': (io.BytesIO(csv_data), 'test_students.csv')}
        response = self.app.post('/api/upload-parse', data=data, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 200)
        json_data = response.get_json()
        self.assertEqual(json_data['status'], 'success')
        self.assertIn('CREATE TABLE test_students', json_data['ddl'])

    def test_upload_parse_json(self):
        """Verify JSON upload parsing endpoint."""
        import io
        json_data = b'[{"order_id": 101, "amount": 99.5}, {"order_id": 102, "amount": 150.0}]'
        data = {'file': (io.BytesIO(json_data), 'orders.json')}
        response = self.app.post('/api/upload-parse', data=data, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 200)
        json_data = response.get_json()
        self.assertEqual(json_data['status'], 'success')
        self.assertIn('CREATE TABLE orders', json_data['ddl'])

if __name__ == '__main__':
    unittest.main()

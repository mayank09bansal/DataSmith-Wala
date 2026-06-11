import os
from dotenv import load_dotenv
from tool_registry import ToolRegistry

load_dotenv()

# Let's test the tool registry processing
test_image = "uploads/Screenshot 2026-06-09 171608.png"  # Pick an existing file
if os.path.exists(test_image):
    print("Testing image processing...")
    result = ToolRegistry.process_file(test_image)
    print("RESULT FROM process_file:", result)
    print("\nChecking agent.py logic:")
    print("result.get('data', {}).get('success'):", result.get('data', {}).get('success'))
    print("Wait, result['data'] keys:", result['data'].keys())
else:
    print("Test file not found.")

import json

with open('/Users/irynaherz/.gemini/antigravity-ide/brain/7eaf6ac3-6091-4057-b56e-2cae1e45d792/.system_generated/logs/transcript.jsonl', 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'VIEW_FILE' in str(data) and 'hero.tsx' in str(data):
                content = data.get('content', '')
                if 'Showing lines 150 to 300' in content:
                    print("FOUND 150-300!")
                    with open('blue_hero_150_300.txt', 'w') as out:
                        out.write(content)
                if 'Showing lines 1 to 150' in content:
                    print("FOUND 1-150!")
                    with open('blue_hero_1_150.txt', 'w') as out:
                        out.write(content)
        except Exception as e:
            pass

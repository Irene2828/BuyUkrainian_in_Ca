import re

def parse_file(filename):
    lines = []
    with open(filename, 'r') as f:
        content = f.read()
        # Find the line that says "Showing lines X to Y"
        # and the line "The following code has been modified"
        started = False
        for line in content.split('\n'):
            if "The following code has been modified" in line:
                started = True
                continue
            if "The above content does NOT show the entire file contents." in line:
                started = False
                continue
            if started:
                # Strip the line number like "123: "
                match = re.match(r'^\d+:\s?(.*)$', line)
                if match:
                    lines.append(match.group(1))
    return lines

lines1 = parse_file('blue_hero_1_150.txt')
lines2 = parse_file('blue_hero_150_300.txt')

# There might be overlap or missing lines, let's see. 
# 1_150 ends at 150. 150_300 starts at 150. We drop the first line of 150_300 if it's a duplicate.
if lines1 and lines2 and lines1[-1] == lines2[0]:
    lines2 = lines2[1:]

all_lines = lines1 + lines2

with open('blue_hero_extracted.txt', 'w') as f:
    f.write('\n'.join(all_lines))

print("Created blue_hero_extracted.txt with %d lines" % len(all_lines))

import sys

file_path = r'c:\Users\eudhi\Downloads\PROJECT-SACP-DHIVAKAR\client\src\app\command\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# The CommandCenterOverview component ends around line 477.
# We found an extra </div> at line 475 (index 474).
# Let's verify the content around there.

print(f"Line 474: {repr(lines[473])}")
print(f"Line 475: {repr(lines[474])}")
print(f"Line 476: {repr(lines[475])}")

# Based on view_file:
# 474: '      </div>\n'
# 475: '    </div>\n'
# 476: '  );\n'

# We want to remove line 475.
if '</div>' in lines[474] and '  );' in lines[475]:
    deleted_line = lines.pop(474)
    print(f"Deleted: {repr(deleted_line)}")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("File updated successfully.")
else:
    print("Verification failed. Lines do not match expected pattern.")

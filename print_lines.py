from pathlib import Path
p=Path(r'C:\Users\ADMIN\OneDrive\Attachments\Desktop\AgriZip\Microfinance\frontend\src\pages\AdminDashboard.jsx')
s=p.read_text(encoding='utf-8')
lines=s.splitlines()
start=4978
end=5015
for i in range(start,end):
    print(f"{i+1:5}: {lines[i]}")

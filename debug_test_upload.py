import urllib.request
import time
import threading
import subprocess
import os
import sys

from app import app

def run_server():
    app.run(host='127.0.0.1', port=5088, debug=False)

th = threading.Thread(target=run_server, daemon=True)
th.start()
time.sleep(1.5)

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
test_html_content = """<!DOCTYPE html>
<html>
<head><title>Test Page</title></head>
<body>
<iframe id="testframe" src="http://127.0.0.1:5088/" style="width:1200px; height:800px;"></iframe>
<div id="results"></div>
<script>
window.onload = function() {
    setTimeout(function() {
        try {
            var doc = document.getElementById('testframe').contentDocument;
            var win = document.getElementById('testframe').contentWindow;
            var out = [];
            out.push("Doc title: " + doc.title);
            out.push("App loaded: " + (!!win.app));
            out.push("FileUploadParser loaded: " + (!!win.app && !!win.app.fileUploadParser));

            // Switch to analyze view
            win.app.switchView('analyze');

            // Click upload tab
            var uploadTab = doc.querySelector('.input-tab-btn[data-pane="pane-upload"]');
            out.push("Upload Tab button found: " + (!!uploadTab));
            if (uploadTab) uploadTab.click();

            // Check preset buttons
            var btnExcel = doc.getElementById('btn-load-sample-excel');
            out.push("btn-load-sample-excel found: " + (!!btnExcel));
            if (btnExcel) btnExcel.click();

            var resCard = doc.getElementById('extracted-schema-result-card');
            out.push("Result Card display after click: " + (resCard ? resCard.style.display : "null"));

            var ddlEditor = doc.getElementById('extracted-ddl-editor');
            out.push("DDL Editor content length: " + (ddlEditor ? ddlEditor.value.length : -1));

            var sqlInput = doc.getElementById('sql-input');
            out.push("SQL Input content length: " + (sqlInput ? sqlInput.value.length : -1));

            document.getElementById('results').innerHTML = out.map(function(l) { return "<p class='test-log'>" + l + "</p>"; }).join("");
        } catch(e) {
            document.getElementById('results').innerHTML = "<p class='test-log'>ERROR: " + e.message + "</p>";
        }
    }, 1500);
};
</script>
</body>
</html>
"""

test_file = os.path.join(os.path.abspath('.'), 'test_upload_probe.html')
with open(test_file, 'w', encoding='utf-8') as f:
    f.write(test_html_content)

file_url = "file:///" + test_file.replace('\\', '/')
cmd = [
    edge_path,
    "--headless",
    "--disable-gpu",
    "--disable-web-security",
    "--virtual-time-budget=4000",
    "--dump-dom",
    file_url
]

try:
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True, timeout=12)
    for line in proc.stdout.splitlines():
        if "test-log" in line:
            print(line.strip())
except Exception as e:
    print("Execution error:", e)
finally:
    if os.path.exists(test_file):
        os.remove(test_file)

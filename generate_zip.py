import zipfile
import os

def create_zip():
    source_dir = r"c:\Users\rajes\Portfolio Projects\JobTracker\extension\dist"
    output_filename = r"c:\Users\rajes\Portfolio Projects\JobTracker\extension\JobTracker-Extension-Final.zip"
    
    print(f"Zipping content from: {source_dir}")
    print(f"Creating: {output_filename}")

    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                # Get the full path of the file
                file_path = os.path.join(root, file)
                
                # Calculate the relative path (this places the file at the root of the zip)
                # e.g. "c:\...\dist\manifest.json" -> "manifest.json"
                arcname = os.path.relpath(file_path, source_dir)
                
                print(f"Adding: {arcname}")
                zipf.write(file_path, arcname)
    
    print("Success! Zip created.")

if __name__ == "__main__":
    create_zip()

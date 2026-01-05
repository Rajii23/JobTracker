from PIL import Image, ImageDraw

def create_briefcase_icon(size):
    # Create transparent image
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Dimensions
    padding = size // 8
    width = size - (2 * padding)
    height = int(width * 0.8)
    
    x_center = size // 2
    y_center = size // 2
    
    # Body Rect
    body_x1 = padding
    body_y1 = y_center - (height // 2) + (size // 10) # Shift down slightly
    body_x2 = size - padding
    body_y2 = body_y1 + height
    
    # Handle
    handle_width = width // 3
    handle_height = height // 3
    handle_x1 = x_center - (handle_width // 2)
    handle_y1 = body_y1 - (handle_height // 2)
    handle_x2 = x_center + (handle_width // 2)
    handle_y2 = body_y1 + (handle_height // 2)
    
    # Draw Handle (Darker Brown)
    draw.rectangle([handle_x1, handle_y1, handle_x2, handle_y2], fill='#8B4513', outline=None)
    # Clear center of handle
    handle_thickness = max(1, size // 16)
    draw.rectangle([handle_x1 + handle_thickness, handle_y1 + handle_thickness, 
                   handle_x2 - handle_thickness, handle_y2], fill=(0,0,0,0), outline=None)
    
    # Draw Body (Tan/Brown)
    # Rounded corners simulation (just simple rect for 16px, rounded for others if possible, but keeping simple for now)
    draw.rounded_rectangle([body_x1, body_y1, body_x2, body_y2], radius=size//10, fill='#D2691E', outline='#8B4513', width=max(1, size//32))
    
    # Draw Flap triangle/Trapezoid
    flap_height = height // 3
    draw.polygon([
        (body_x1, body_y1),
        (body_x2, body_y1),
        (x_center, body_y1 + flap_height)
    ], fill='#CD853F', outline='#8B4513')

    return img

sizes = [16, 48, 128]
output_dir = r"c:\Users\rajes\Portfolio Projects\JobTracker\extension\public\icons"

for s in sizes:
    img = create_briefcase_icon(s)
    path = f"{output_dir}\\icon{s}.png"
    img.save(path)
    print(f"Saved {path}")

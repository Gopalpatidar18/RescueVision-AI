import cv2
import numpy as np
from PIL import Image

from app.config import FREE_TIER_MODE, UNET_MODEL

model = None
transform = None
torch_module = None


def enhance_image(frame):
    global model, transform, torch_module
    if model is None:
        if not UNET_MODEL.is_file():
            if FREE_TIER_MODE:
                return cv2.detailEnhance(frame, sigma_s=10, sigma_r=0.15)
            raise FileNotFoundError(f"U-Net checkpoint is missing: {UNET_MODEL}")

        import torch as imported_torch
        from torchvision import transforms
        from unet_training.unet import UNet

        model = UNet()
        torch_module = imported_torch
        device = torch_module.device("cpu")
        model.load_state_dict(torch_module.load(UNET_MODEL, map_location=device))
        model.eval()
        transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.ToTensor(),
        ])

    h, w = frame.shape[:2]

    image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    tensor = transform(image).unsqueeze(0)

    with torch_module.no_grad():
        output = model(tensor)

    output = output.squeeze().permute(1, 2, 0).numpy()
    output = (output * 255).clip(0, 255).astype(np.uint8)

    output = cv2.cvtColor(output, cv2.COLOR_RGB2BGR)

    output = cv2.resize(output, (w, h))

    return output
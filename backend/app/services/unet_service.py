import torch
import cv2
import numpy as np
from PIL import Image
from torchvision import transforms

from app.config import UNET_MODEL
from unet_training.unet import UNet

device = torch.device("cpu")

model = UNet()
model.load_state_dict(
    torch.load(
        UNET_MODEL,
        map_location=device
    )
)
model.eval()

transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor()
])


def enhance_image(frame):
    h, w = frame.shape[:2]

    image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        output = model(tensor)

    output = output.squeeze().permute(1, 2, 0).numpy()
    output = (output * 255).clip(0, 255).astype(np.uint8)

    output = cv2.cvtColor(output, cv2.COLOR_RGB2BGR)

    output = cv2.resize(output, (w, h))

    return output
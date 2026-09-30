import os
import torch
from PIL import Image
from torchvision import transforms

from unet import UNet

device = torch.device("cpu")

model = UNet()
model.load_state_dict(torch.load("models/unet_best.pth", map_location=device))
model.eval()

transform = transforms.Compose([
    transforms.Resize((256,256)),
    transforms.ToTensor()
])

os.makedirs("outputs", exist_ok=True)

test_folder = "dataset/test/hazy"

for file in os.listdir(test_folder):

    if file.lower().endswith((".png",".jpg",".jpeg")):

        image = Image.open(os.path.join(test_folder,file)).convert("RGB")

        tensor = transform(image).unsqueeze(0)

        with torch.no_grad():
            output = model(tensor)

        output = output.squeeze().permute(1,2,0).numpy()
        output = (output*255).clip(0,255).astype("uint8")

        Image.fromarray(output).save(
            os.path.join("outputs",file)
        )

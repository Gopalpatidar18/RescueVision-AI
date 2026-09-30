import os
from PIL import Image
from torch.utils.data import Dataset
from torchvision import transforms

class DenseHazeDataset(Dataset):

    def __init__(self, hazy_dir, clear_dir):
        self.hazy_dir = hazy_dir
        self.clear_dir = clear_dir

        self.hazy_images = sorted(os.listdir(hazy_dir))
        self.clear_images = sorted(os.listdir(clear_dir))

        self.transform = transforms.Compose([
            transforms.Resize((256,256)),
            transforms.ToTensor()
        ])

    def __len__(self):
        return len(self.hazy_images)

    def __getitem__(self,index):

        hazy = Image.open(
            os.path.join(self.hazy_dir,self.hazy_images[index])
        ).convert("RGB")

        clear = Image.open(
            os.path.join(self.clear_dir,self.clear_images[index])
        ).convert("RGB")

        return self.transform(hazy), self.transform(clear)
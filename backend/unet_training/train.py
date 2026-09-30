import os
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

from dataset import DenseHazeDataset
from unet import UNet

device = torch.device("cpu")

# ----------------------------
# Datasets
# ----------------------------

train_dataset = DenseHazeDataset(
    "dataset/train/hazy",
    "dataset/train/clear"
)

val_dataset = DenseHazeDataset(
    "dataset/val/hazy",
    "dataset/val/clear"
)

train_loader = DataLoader(
    train_dataset,
    batch_size=4,
    shuffle=True
)

val_loader = DataLoader(
    val_dataset,
    batch_size=4,
    shuffle=False
)

# ----------------------------
# Model
# ----------------------------

model = UNet().to(device)

criterion = nn.L1Loss()

optimizer = torch.optim.Adam(
    model.parameters(),
    lr=0.0001
)

epochs = 20

best_loss = float("inf")

os.makedirs("models", exist_ok=True)

# ----------------------------
# Training Loop
# ----------------------------

for epoch in range(epochs):

    model.train()

    train_loss = 0

    for hazy, clear in train_loader:

        hazy = hazy.to(device)
        clear = clear.to(device)

        output = model(hazy)

        loss = criterion(output, clear)

        optimizer.zero_grad()

        loss.backward()

        optimizer.step()

        train_loss += loss.item()

    avg_train_loss = train_loss / len(train_loader)

    # ----------------------------
    # Validation
    # ----------------------------

    model.eval()

    val_loss = 0

    with torch.no_grad():

        for hazy, clear in val_loader:

            hazy = hazy.to(device)
            clear = clear.to(device)

            output = model(hazy)

            loss = criterion(output, clear)

            val_loss += loss.item()

    avg_val_loss = val_loss / len(val_loader)

    print(
        f"Epoch {epoch+1}/{epochs} | "
        f"Train Loss: {avg_train_loss:.4f} | "
        f"Val Loss: {avg_val_loss:.4f}"
    )

    if avg_val_loss < best_loss:

        best_loss = avg_val_loss

        torch.save(
            model.state_dict(),
            "models/unet_best.pth"
        )

        print("✅ Best model saved.")

print("\nTraining Completed!")
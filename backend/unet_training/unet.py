import torch
import torch.nn as nn

class DoubleConv(nn.Module):

    def __init__(self,in_channels,out_channels):
        super().__init__()

        self.conv=nn.Sequential(

            nn.Conv2d(in_channels,out_channels,3,1,1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),

            nn.Conv2d(out_channels,out_channels,3,1,1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)

        )

    def forward(self,x):
        return self.conv(x)

class UNet(nn.Module):

    def __init__(self):

        super().__init__()

        self.down1=DoubleConv(3,64)
        self.pool1=nn.MaxPool2d(2)

        self.down2=DoubleConv(64,128)
        self.pool2=nn.MaxPool2d(2)

        self.down3=DoubleConv(128,256)
        self.pool3=nn.MaxPool2d(2)

        self.down4=DoubleConv(256,512)
        self.pool4=nn.MaxPool2d(2)

        self.bridge=DoubleConv(512,1024)

        self.up1=nn.ConvTranspose2d(1024,512,2,2)
        self.conv1=DoubleConv(1024,512)

        self.up2=nn.ConvTranspose2d(512,256,2,2)
        self.conv2=DoubleConv(512,256)

        self.up3=nn.ConvTranspose2d(256,128,2,2)
        self.conv3=DoubleConv(256,128)

        self.up4=nn.ConvTranspose2d(128,64,2,2)
        self.conv4=DoubleConv(128,64)

        self.final=nn.Conv2d(64,3,1)

    def forward(self,x):

        d1=self.down1(x)
        p1=self.pool1(d1)

        d2=self.down2(p1)
        p2=self.pool2(d2)

        d3=self.down3(p2)
        p3=self.pool3(d3)

        d4=self.down4(p3)
        p4=self.pool4(d4)

        bridge=self.bridge(p4)

        u1=self.up1(bridge)
        u1=torch.cat([u1,d4],dim=1)
        u1=self.conv1(u1)

        u2=self.up2(u1)
        u2=torch.cat([u2,d3],dim=1)
        u2=self.conv2(u2)

        u3=self.up3(u2)
        u3=torch.cat([u3,d2],dim=1)
        u3=self.conv3(u3)

        u4=self.up4(u3)
        u4=torch.cat([u4,d1],dim=1)
        u4=self.conv4(u4)

        return self.final(u4)
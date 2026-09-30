from ultralytics import YOLO

def main():
    model = YOLO("yolov8m.pt")

    model.train(
        data="dataset/data.yaml",
        epochs=50,
        imgsz=640,
        batch=8,
        workers=2,
        device="cpu",
        project="runs",
        name="person_detection"
    )

if __name__ == "__main__":
    main()
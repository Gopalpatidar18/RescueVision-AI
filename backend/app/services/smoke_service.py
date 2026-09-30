import cv2
import os

OUTPUT_FOLDER = "app/outputs"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def remove_smoke(image_path):
    image = cv2.imread(image_path)

    # Simple enhancement (placeholder for U-Net)
    enhanced = cv2.detailEnhance(image, sigma_s=10, sigma_r=0.15)

    output_path = os.path.join(
        OUTPUT_FOLDER,
        "enhanced_" + os.path.basename(image_path)
    )

    cv2.imwrite(output_path, enhanced)

    return output_path
# Import necessary libraries
import cv2
import numpy as np
import tensorflow as tf
import pyttsx3

# Initialize OpenCV webcam feed
cap = cv2.VideoCapture(0)

# Load TensorFlow object detection model
# Assume model is trained and exported to 'model' folder
model = tf.saved_model.load('model') 
category_index = {1: {'id': 1, 'name': 'person'}, 2: {'id': 2, 'name': 'cat'}} # Sample category index

# Initialize text-to-speech engine  
engine = pyttsx3.init() 

while True:
    # Read frame from webcam 
    ret, image_np = cap.read()
    
    # Expand dimensions since the model expects images to have shape [1, None, None, 3]
    image_np_expanded = np.expand_dims(image_np, axis=0)
    
    # Perform object detection
    input_tensor = tf.convert_to_tensor(image_np_expanded)
    detections = model(input_tensor)
        
    # Process detections and get bounding box coordinates
    num_detections = int(detections.pop('num_detections'))
    detections = {key: value[0, :num_detections].numpy()
                  for key, value in detections.items()}
    boxes = detections['detection_boxes']
    classes = detections['detection_classes'].astype(np.int64)
    scores = detections['detection_scores']

    # Initialize text-to-speech 
    engine.say("Detected")
    
    for i in range(len(scores)):
        if ((scores[i] > 0.5) and (scores[i] <= 1.0)):
            # Extract bounding box coordinates
            (x, y, w, h) = boxes[i]
            class_name = category_index[classes[i]]['name']
            
            # Print detection results 
            print("Object: "+str(class_name))
            print("Coordinates: "+str((x,y,w,h)))
            
            # Speak detection results
            engine.say(class_name+" detected")

    engine.runAndWait()
            
cap.release()
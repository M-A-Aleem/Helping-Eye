


import { getGradient, math } from "@tensorflow/tfjs";

export const drawRect = (detections , ctx) =>{
      detections.forEach(predection=>{
    const[x,y,width,height]=predection['bbox'];
       const text = predection['class'];

     const colour ='black'
     ctx.strokeStyle = colour
     ctx.font = '38px Arial'
     ctx.fillStyle = getGradient
    

     ctx.beginPath()
     ctx.fillText(text,x,y)
     ctx.rect(x,y,width,height)
     ctx.stroke()


 } )




}
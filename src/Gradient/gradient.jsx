import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

function Gradient({style}) {

    return (


            <ShaderGradientCanvas
                style={style}
                pointerEvents='none'

            >
                <ShaderGradient
                    control='query'
                    urlString='https://www.shadergradient.co/customize?animate=on&axesHelper=on&bgColor1=%23000000&bgColor2=%23000000&brightness=1.5&cAzimuthAngle=60&cDistance=7.1&cPolarAngle=90&cameraZoom=20.8&color1=%23ff7a33&color2=%2333a0ff&color3=%23ffc53d&destination=onCanvas&embedMode=off&envPreset=dawn&format=gif&fov=45&frameRate=10&grain=off&http%3A%2F%2Flocalhost%3A3002%2Fcustomize%3Fanimate=on&lightType=3d&pixelDensity=1&positionX=0&positionY=-0.15&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=0&shader=defaults&type=sphere&uAmplitude=6.9&uDensity=1.2&uFrequency=5.5&uSpeed=0.1&uStrength=0.9&uTime=0&wireframe=false&zoomOut=false'
                />
            </ShaderGradientCanvas>

    )
}

export default Gradient
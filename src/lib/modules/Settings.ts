interface CameraSettings {
    maxZoom?: {
        in?: number | string,
        out?: number | string
    },
    maxRotation?: {
        vertical?: [number, number],
        horizontal?: [number, number],
    },
    currentZoom?: number | string
    currentRotation?: {
        vertical?: number,
        horizontal?: number
    },
    canRotate?: boolean,
    canZoom?: boolean,
    canPan?: boolean,
    enablePanFalloff?: boolean,
    enableZoomFalloff?: boolean,
    focusDisplay?: boolean,
}

interface SceneSettings {
    ambientIntensity?: number,
    ambientColor?: string | number,
    enable?: boolean
}

interface ObjectSettings {
    wireframe?: boolean,
    flatShade?: boolean,
    boundBox?: boolean
}

interface Settings {
    camera?: CameraSettings,
    scene?: SceneSettings,
    object?: ObjectSettings
}

type rotation = {
    vertical: number,
    horizontal: number
}

export type { CameraSettings, SceneSettings, ObjectSettings, Settings, rotation };
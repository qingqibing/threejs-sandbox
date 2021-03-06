export const ColorResolveShader = {

	uniforms: {

		intersectBuffer: { value: null },
		sourceBuffer: { value: null },
		packedBuffer: { value: null },

		intensity: { value: 0.5 },

	},

	vertexShader:
		/* glsl */`
		varying vec2 vUv;
		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}
	`,

	fragmentShader:
		/* glsl */`
		#include <common>
		#include <packing>
		#define EDGE_FADE 0.3
		varying vec2 vUv;
		uniform sampler2D intersectBuffer;
		uniform sampler2D sourceBuffer;
		uniform sampler2D packedBuffer;

		uniform float intensity;
		void main() {

			// Found, blending
			vec4 source = texture2D( sourceBuffer, vUv );
			vec4 intersect = texture2D( intersectBuffer, vUv );
			vec2 hitUV = intersect.xy;
			float stepRatio = intersect.z;
			float intersected = intersect.a;
			if ( intersected > 0.5 ) {

				vec4 col = texture2D( sourceBuffer, hitUV, 10.0 );
				vec2 ndc = abs( hitUV * 2.0 - 1.0 );
				float maxndc = max( abs( ndc.x ), abs( ndc.y ) ); // [ -1.0, 1.0 ]
				float rayLengthFade = 1.0 - stepRatio;
				float ndcFade = 1.0 - ( max( 0.0, maxndc - EDGE_FADE ) / ( 1.0 - EDGE_FADE )  );
				float fadeVal = min( rayLengthFade, ndcFade );

				// source += col * intensity * ( 1.0 - roughness ) * fadeVal;
				source += col * intensity * fadeVal;

			}

			gl_FragColor = source;
			// gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

		}
	`

}

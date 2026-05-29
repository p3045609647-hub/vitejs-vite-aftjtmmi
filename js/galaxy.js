(function() {
    const canvas = document.getElementById('galaxy-canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener('resize', resize);
    resize();

    const vert = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0, 1);
        }
    `;

    const frag = `
        precision highp float;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uMouse;

        float hash21(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
        }

        float star(vec2 uv, float flare) {
            float d = length(uv);
            float m = 0.03 / d;
            float rays = max(0.0, 1.0 - abs(uv.x * uv.y * 1000.0));
            m += rays * flare;
            m *= smoothstep(1.0, 0.2, d);
            return m;
        }

        vec3 starLayer(vec2 uv, float t) {
            vec3 col = vec3(0.0);
            vec2 gv = fract(uv) - 0.5;
            vec2 id = floor(uv);
            for (int y = -1; y <= 1; y++) {
                for (int x = -1; x <= 1; x++) {
                    vec2 offset = vec2(float(x), float(y));
                    vec2 si = id + offset;
                    float seed = hash21(si);
                    float size = fract(seed * 345.32);
                    float flare = smoothstep(0.9, 1.0, size) * sin(t * 2.0 + seed * 6.28) * 0.5 + 0.5;
                    vec2 pos = gv - offset - vec2(
                        fract(seed * 34.0) - 0.5,
                        fract(seed * 78.0) - 0.5
                    ) * 0.6;
                    float s = star(pos, flare * 0.5);
                    float hue = fract(seed + 0.6);
                    vec3 color = 0.5 + 0.5 * cos(6.28318 * (hue + vec3(0.0, 0.33, 0.67)));
                    col += s * size * color;
                }
            }
            return col;
        }

        void main() {
            vec2 uv = (gl_FragCoord.xy - uResolution * 0.5) / uResolution.y;
            float t = uTime * 0.1;
            vec3 col = vec3(0.0);
            for (float i = 0.0; i < 1.0; i += 0.25) {
                float depth = fract(i + t);
                float scale = mix(15.0, 0.5, depth);
                float fade = depth * smoothstep(1.0, 0.9, depth);
                col += starLayer(uv * scale + i * 453.32, uTime) * fade;
            }
            float dist = length(uv);
            col *= smoothstep(1.2, 0.3, dist) * 0.8 + 0.2;
            gl_FragColor = vec4(col, 1.0);
        }
    `;

    function createShader(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
    }

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl.VERTEX_SHADER, vert));
    gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uRes = gl.getUniformLocation(program, 'uResolution');
    const uMouse = gl.getUniformLocation(program, 'uMouse');

    let mouse = [0.5, 0.5];
    window.addEventListener('mousemove', e => {
        mouse = [e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight];
    });

    function render(t) {
        gl.uniform1f(uTime, t * 0.001);
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform2f(uMouse, mouse[0], mouse[1]);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
})();
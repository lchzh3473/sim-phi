export default hook.define({
  name: 'Filter',
  description: 'Apply filter to canvas',
  contents: [
    {
      type: 'config',
      meta: ['启用滤镜', callback]
    }
  ]
});
/**
 * @param {HTMLInputElement} checkbox
 * @param {HTMLDivElement} container
 */
function callback(checkbox, container) {
  const { status } = hook;
  const input = document.createElement('textarea');
  Object.assign(input, { placeholder: '在此输入着色器代码' });
  input.style.cssText += ';width:150px;height:1em;margin-left:10px';
  input.addEventListener('change', () => {
    try {
      const filter0 = new Filter(input.value);
      hook.filter = (ctx, time, now) => {
        filter0.apply(ctx.canvas);
        ctx.drawImage(filter0.getImage(time, now, hook.filterOptions), 0, 0);
      };
    } catch (e) {
      console.error(e);
      hook.filter = null;
    }
  });
  status.reg('filterText', input, false);
  container.appendChild(input);
  checkbox.addEventListener('change', () => {
    input.classList.toggle('disabled', !checkbox.checked);
    if (checkbox.checked) input.dispatchEvent(new Event('change'));
    else hook.filter = null;
  });
  status.reg('enableFilter', checkbox);
}
const vsSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = a_texCoord;
  }
`;
// const fsSource = `
//   precision highp float;
//   uniform sampler2D u_image;
//   uniform float u_time;
//   varying vec2 v_texCoord;
//   void main() {
//     vec2 uv = v_texCoord;
//     vec4 color = texture2D(u_image, uv);
//   }
// `;
function Filter(/** @type {string} */fsSource) {
  this.fsSource = fsSource.replace(/\xa0/g, ' '); // replace &nbsp; with space (fix copy-paste from web)
  const canvas = document.createElement('canvas');
  /** @type {WebGLRenderingContext} */
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const program = gl.createProgram();
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vsSource);
  gl.compileShader(vertexShader);
  gl.attachShader(program, vertexShader);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, this.fsSource);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) throw new SyntaxError(gl.getShaderInfoLog(fragmentShader) || 'Unknown error');
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, 1, 1, 1, -1, -1, -1]), gl.STATIC_DRAW);
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), gl.STATIC_DRAW);
  const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
  const imageTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, imageTexture);
  // Linear filtering.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // Clamp to the edge to prevent semi-transparent borders.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const imageLocation = gl.getUniformLocation(program, 'u_image');
  gl.uniform1i(imageLocation, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, imageTexture);
  this.canvas = canvas;
  this.gl = gl;
  this.program = program;
}
Filter.prototype.apply = function(img) {
  const { gl, canvas } = this;
  canvas.width = img.width;
  canvas.height = img.height;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  return canvas;
};
Filter.prototype.getImage = function(time, now, obj = {}) {
  const { gl } = this;
  const uniformLength = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < uniformLength; i++) {
    const { type, name } = gl.getActiveUniform(this.program, i);
    const location = gl.getUniformLocation(this.program, name);
    switch (name) {
      case 'u_name':
        gl.uniform1f(location, time);
        break;
      case 'u_now':
        gl.uniform1f(location, now);
        break;
      case 'u_aspect':
        gl.uniform1f(location, this.canvas.width / this.canvas.height);
        break;
      default:
        if (type === gl.FLOAT) {
          if (obj[name] !== undefined) gl.uniform1f(location, obj[name]);
        }
        // if (type === gl.SAMPLER_2D) {
        //   const id = this.program.uniforms[name];
        //   gl.useProgram(this.program);
        //   gl.activeTexture(gl[`TEXTURE${id}`]);
        //   gl.uniform1i(location, id);
        // } else if (type === gl.FLOAT_MAT4) {
        //   this[name] = location;
        // }
    }
  }
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  return this.canvas;
};

/**
 * ImageEffects JavaScript Library v0.1
 * http://www.sloky.net/
 * Copyright 2012, Matt Slocum
 * Licensed under the MIT or GPL Version 2 licenses.
 * Date: June 23, 2012
 *
 * Copyright (C) 2012 by Matt Slocum
 * Thanks to http://processing.org/learning/pixels/
 * http://en.wikipedia.org/wiki/Blend_modes
 * http://dunnbypaul.net/blends/
 * http://docs.gimp.org/en/gimp-concepts-layer-modes.html
 * http://stackoverflow.com/questions/5919663/how-does-photoshop-blend-two-images-together
 *
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/*

http://stackoverflow.com/questions/2471226/dynamically-pixelate-an-html-image-element
http://dev.w3.org/html5/2dcontext/#imagedata
http://docs.gimp.org/en/gimp-concepts-layer-modes.html#ftn.gimp-layer-mode-bug162395
http://en.wikipedia.org/wiki/Alpha_compositing
http://en.wikipedia.org/wiki/Blend_modes
http://stackoverflow.com/questions/2688961/how-do-i-tint-an-image-with-html5-canvas
http://processing.org/learning/pixels/
http://stackoverflow.com/questions/5919663/how-does-photoshop-blend-two-images-together
http://rastergrid.com/blog/2010/09/efficient-gaussian-blur-with-linear-sampling/
http://create.msdn.com/en-US/education/catalog/sample/bloom
http://haishibai.blogspot.com/2009/09/image-processing-c-tutorial-4-gaussian.html
http://social.msdn.microsoft.com/Forums/en-US/csharpgeneral/thread/84322232-e16a-48cb-b3bc-a0300df15774/
http://www.miszalok.de/Lectures/L07_ImageProcessing/IP_Filters/IP_Filters_d.htm#a1
http://www.idav.ucdavis.edu/education/CAGDNotes/Uniform-B-Splines-as-a-Convolution.pdf
http://stereopsis.com/kpt/kptblur.html
http://en.wikipedia.org/wiki/Gaussian_blur
http://pippin.gimp.org/image_processing/chap_area.html
http://www.gutgames.com/post/Box-Blur-and-Gaussian-Blur-Sort-of.aspx
http://www.jhlabs.com/ip/blurring.html
http://web.archive.org/web/20090529052431/http://home.scarlet.be/zoetrope/blur.htm
http://www.codeproject.com/Articles/6440/The-Art-of-Noise
http://beej.us/blog/data/html5s-canvas-2-pixel/


*/

export class ImageEffects {
	private debugging : boolean = true;
	private container : HTMLElement;
	private image : HTMLImageElement;
	private canvas : HTMLCanvasElement = document.createElement('canvas');
	private context : CanvasRenderingContext2D = this.canvas.getContext('2d');
	private data : Uint8ClampedArray;
	private debuging : boolean = false;
	public imageData : ImageData;


	constructor(config: any) {
		this.canvas.style.position = 'absolute';

		if (typeof config.container === 'string') {
			//create a canvas and append it to container
			this.container = document.getElementById(config.container);
			this.container.appendChild(this.canvas);
		} else {
	//    	document.getElementsByTagName('body')[0].appendChild(this.canvas);
		}
		if (config.src) {
			this.setImage(config.src);
		}
	}

	setImage(src) {
		let img = new Image();
		img.onload = () => {
			this.image = img;
			this.resizeCanvas(img.height, img.width);
			this.context.drawImage(img, 0, 0, img.width, img.height);
			this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
			this.data = this.imageData.data;
		};
		img.src = src;
	}
	
	// sets the this.data array into the canvas
	displayImage() {
		// cant reasign .data to imageData object so loop over data and put it back into imageData
		for (let i = 0; i < this.data.length; i++) {
			this.imageData.data[i] = this.data[i];
		}
		this.context.putImageData(this.imageData, 0, 0);
	}
	
	resizeCanvas(height, width) {
		if (this.container) {
			this.container.style.height = height +'px';
			this.container.style.width = width +'px';
		}
		this.canvas.height = height;
		this.canvas.width = width;
	}
	
	invert() {
		//let imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		let d = this.imageData.data;
		for (let i = 0; i < d.length; i += 4) {
			d[i] = 255 - d[i]; //red
			d[i+1] = 255 - d[i+1]; //green
			d[i+2] = 255 - d[i+2]; //blue
		}
		this.context.putImageData(this.imageData, 0, 0);
	}
	
	desaturate() {
		//let imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		let d = this.imageData.data;
		for (let i = 0; i < d.length; i += 4) {
			let set = d[i]*.59 + d[i+1]*.3 + d[i+2]*.11;
			d[i] = set; //red
			d[i+1] = set; //green
			d[i+2] = set; //blue
		}
		this.context.putImageData(this.imageData, 0, 0);
	}
	
	threshold(amt) {
		amt = ( !isNaN(parseInt(amt)) ) ? parseInt(amt) : 127;
		//let imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		let d = this.imageData.data;
		for (let i = 0; i < d.length; i += 4) {
			let set = d[i]*.59 + d[i+1]*.3 + d[i+2]*.11; //deaturate first
			set = (set >= amt) ? 255 : 0;
			d[i] = set; //red
			d[i+1] = set; //green
			d[i+2] = set; //blue
		}
		this.context.putImageData(this.imageData, 0, 0);
	}
	
	// 1 arg changes brightness to RGB
	// 2 args changes 1st arg brightness to RGB & 2nd to alpha
	// 3 args changes RGB respectivly
	// 4 args changes RGBA respectivly
    tint(...args : Array<number>) : void {
        let t : any = { r:255, g:255, b:255, a:255 };
        switch (args.length) {
            case 0:
                return; // arg required
            case 1:
                t.r = t.g = t.b = args[0];
                break;
            case 2:
                t.r = t.g = t.b = args[0];
                t.a = args[1];
                break;
            case 3:
                t.r = args[0];
                t.g = args[1];
                t.b = args[2];
                break;
            case 4:
                t.r = args[0];
                t.g = args[1];
                t.b = args[2];
                t.a = args[3];
                break;
            default:
                return; // invalid # args
        }
        //var imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        let d = this.imageData.data;
        for (let i = 0; i < d.length; i += 4) {
            d[i] -= 255 - t.r; //red
            d[i+1] -= 255 - t.g; //green
            d[i+2] -= 255 - t.b; //blue
            d[i+3] -= 255 - t.a; //alpha
        }
        this.context.putImageData(this.imageData, 0, 0);
    }

	private tint_adj(t : any) : void {
		//let imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		let d = this.imageData.data;
		for (let i = 0; i < d.length; i += 4) {
			d[i] -= 255 - t.r; //red
			d[i+1] -= 255 - t.g; //green
			d[i+2] -= 255 - t.b; //blue
			d[i+3] -= 255 - t.a; //alpha
		}
		this.context.putImageData(this.imageData, 0, 0);
	}
	
	toDataURL() {
		return this.canvas.toDataURL();
	}
	
	constrain(i, min, max) {
		return Math.min(Math.max(i, min), max);
	}
	
	// range -255 to 255
	brightness(amt) {
		amt = ( !isNaN(parseInt(amt)) ) ? parseInt(amt) : 0;
		let d = this.data;
		for (let i = 0; i < d.length; i += 4) {
			d[i] += amt; //red
			d[i+1] += amt; //green
			d[i+2] += amt; //blue
			//d[i+3] = func(d[i+3], t[i+3]); // alpha
		}
		this.displayImage();
	}

	contrast(amt) {
		amt = ( !isNaN(parseFloat(amt)) ) ? parseFloat(amt) : 0;
		amt = ((amt + 510) / 510) * ((amt + 510) / 510);
		this.debug(amt);
		let d = this.data;
		for (let i = 0; i < d.length; i += 4) {
			d[i] = (d[i] - 127) * amt + 127; //red
			d[i+1] = (d[i+1] - 127) * amt + 127; //green
			d[i+2] = (d[i+2] - 127) * amt + 127; //blue
//			d[i] = ((d[i]/255 - 0.5) * amt + 0.5) * 255; //red
//			d[i+1] = ((d[i+1]/255 - 0.5) * amt + 0.5) * 255; //green
//			d[i+2] = ((d[i+2]/255 - 0.5) * amt + 0.5) * 255; //blue
			//d[i+3] = func(d[i+3], t[i+3]); // alpha
		}
		this.displayImage();
	}

	// top needs to be an imageEffects object, or it will pick itself
	_blend(topImg, func) {
		if (typeof topImg != "object")
			topImg = this;
		let d = this.data;
		let t;
		if (topImg instanceof ImageData) {
			t = topImg.data;
		} else {
			t = topImg.context.getImageData(0, 0, topImg.canvas.width, topImg.canvas.height).data;
		}
		//TODO: if the top is wider than bottom then the index needs to be adjusted for top
		for (let i = 0; i < d.length; i += 4) {
			d[i] = func(d[i], t[i]); //red
			d[i+1] = func(d[i+1], t[i+1]); //green
			d[i+2] = func(d[i+2], t[i+2]); //blue
			//d[i+3] = func(d[i+3], t[i+3]); // alpha
		}
		//this.context.putImageData(imageData, 0, 0);
		this.displayImage();
	}
	
	// b for bottom. t for top
	darken(topImg) {
		this._blend(topImg, function(b, t) {
			return Math.min(b,t);
		});
	}
	multiply(topImg) {
		this._blend(topImg, function(b, t) {
			return b * t / 255;
		});
	}
	colorBurn(topImg) {
		this._blend(topImg, function(b, t) {
			return 255 - (255-b) / (t/255);
		});
	}
	linearBurn(topImg) {
		this._blend(topImg, function(b, t) {
			return b + t - 255;
		});
	}
	lighten(topImg) {
		this._blend(topImg, function(b, t) {
			return Math.max(b, t);
		});
	}
	screen(topImg) {
		this._blend(topImg, function(b, t) {
			return 255 - (255-b) * (255-t) / 255;
		});
	}
	// very close to PS
	colorDodge(topImg) {
		this._blend(topImg, function(b, t) {
			return b / (1-t/255);
		});
	}
	linearDodge(topImg) {
		this._blend(topImg, function(b, t) {
			return b + t;
		});
	}
	overlay(topImg) {
		this._blend(topImg, function(b, t) {
			if (b > 127)
				return (1 - (1 - 2*(b/255 - .5)) * (1 - t/255))*255
			return (2 * (b/255) * (t/255))*255;
		});
	}
	//softLight is approximate (noticable)
	softLight(topImg) {
		this._blend(topImg, function(b, t) {
			if (t > 127)
				return (1 - (1-b/255) * (1-(t/255 - .5)))*255;
			return b * (t/255 + .5);
//			return t/255 * ( t + 2*b/255 * (255-t) );
		});
	}
	// BUG
	hardLight(topImg) {
		this._blend(topImg, function(b, t) {
			return this.overlay(t, b);
		});
	}
	// BUG
	vividLight(topImg) {
		this._blend(topImg, function(b, t) {
			if (t > 127)
				return (1 - (1-b/255) / (2*(t/255 - .5)))*255;
			return ((b/255) / (1 - 2*(t/255)))*255;
		});
	}
	linearLight(topImg) {
		this._blend(topImg, function(b, t) {
			return (b/255 + 2*(t/255) - 1)*255;
		});
	}
	pinLight(topImg) {
		this._blend(topImg, function(b, t) {
			if (t > 127)	
				return Math.max(b, 2*(t-127));
			return Math.min(b, 2*t);
		});
	}
	difference(topImg) {
		this._blend(topImg, function(b, t) {
			return Math.abs(b-t);
		});
	}
	exclusion(topImg) {
		this._blend(topImg, function(b, t) {
			return (.5 - 2*(b/255 -.5) * (t/255 -.5))*255;
		});
	}
	subtract(topImg) {
		this._blend(topImg, function(b, t) {
			return Math.max(0, b-t);
		});
	}
	divide(topImg) {
		this._blend(topImg, function(b, t) {
			return (256 * b) / (t + 1);
		});
	}
	
	// imageD needs to be an imageData object to get the height and width.
	// returns rgba object from x, y cordinates
	getPixel(imageData, y, x) {
		y = this.constrain(y, 0, imageData.height-1);
		x = this.constrain(x, 0, imageData.width-1);
		let i = (y * imageData.width + x) * 4;
		return {r: imageData.data[i], g: imageData.data[i +1], b: imageData.data[i +2], a: imageData.data[i +3] };
	}
	
	indexToXY(i) {
		i = Math.floor(i / 4);
		return { x: i % this.imageData.width, y: Math.floor(i / this.imageData.width) };
	}
	
	convolve() {
		let result = this.context.createImageData(this.imageData);
		let r = result.data;
		let d = this.data;
		let t = [];
		// edge  detection
		let matrix = 	[[1, 1, 1],
						 [1, -8, 1],
						 [1, 1, 1]];
		// blur
		matrix = 	[[1/9, 1/9, 1/9],
						 [1/9, 1/9, 1/9],
						 [1/9, 1/9, 1/9]];
		// emboss
		matrix = 	[[-2, -1, 0],
					 [-1, 1, 1],
					 [0, 1, 2]];
		// sharpen
		matrix = 	[[0, -1, 0],
					 [-1, 5, -1],
					 [0, -1, 0]];
					 
		let offset = (matrix.length-1) / 2;
		let rgb = {r: 0, g: 0, b: 0};
		let pix, mpix;

		let z = 0; //array index
		// todo: make this more efficient than 4 loops
		for (let y = 0; y < this.imageData.height; y++) {
			for (let x = 0; x < this.imageData.width; x++) {
				t[z] = t[z+1] = t[z+2] = t[x+3] = 0;
				for (let j = -offset; j < offset*2; j++) {
					for (let i = -offset; i < offset*2; i++) {
						mpix = this.getPixel(this.imageData, y+j, x+i);
						t[z] += mpix.r * matrix[j+offset][i+offset];
						t[z+1] += mpix.g * matrix[j+offset][i+offset];
						t[z+2] += mpix.b * matrix[j+offset][i+offset];
					}
				}
				r[z] = t[z];
				r[z+1] = t[z+1];
				r[z+2] = t[z+2];
				r[z+3] = d[z+3];
				if (z == 0) {
					//console.log(t);
					//alert('here');
				}
				z += 4;
				//if (i < 4*10) console.log(d[i]);
			}
			//this.debug(t[i]);
		}
		
		this.context.putImageData(result, 0, 0);
	}
		
	// convolution(x, y, matrix, img) {
	// 	let rtotal = 0.0;
	// 	let gtotal = 0.0;
	// 	let btotal = 0.0;
	// 	let offset = matrix.length / 2;
	// 	// Loop through convolution matrix
	// 	for (let i = 0; i < matrix.length; i++){
	// 		for (let j= 0; j < matrix.length; j++){
	// 			// What pixel are we testing
	// 			let xloc = x+i-offset;
	// 			let yloc = y+j-offset;
	// 			let loc = xloc + img.width*yloc;
	// 			// Make sure we have not walked off the edge of the pixel array
	// 			loc = constrain(loc,0,img.pixels.length-1);
	// 			// Calculate the convolution
	// 			// We sum all the neighboring pixels multiplied by the values in the convolution matrix.
	// 			rtotal += (red(img.pixels[loc]) * matrix[i][j]);
	// 			gtotal += (green(img.pixels[loc]) * matrix[i][j]);
	// 			btotal += (blue(img.pixels[loc]) * matrix[i][j]);
	// 		}
	// 	}
	// 	// Make sure RGB is within range
	// 	rtotal = constrain(rtotal,0,255);
	// 	gtotal = constrain(gtotal,0,255);
	// 	btotal = constrain(btotal,0,255);
	// 	// Return the resulting color
	// 	return color(rtotal,gtotal,btotal);
	// }
	
	blur(radius) {
		this.debug('doing blur');
//		let matrix = [ [1/9, 1/9, 1/9], [1/9, 1/9, 1/9], [1/9, 1/9, 1/9] ];
		let matrix = this.gaussianKernel(radius);
		this.debug(matrix);
		return;
/*		matrix = [[0.00000067,	0.00002292,	0.00019117,	0.00038771,	0.00019117,	0.00002292,	0.00000067],
				[0.00002292,	0.00078633,	0.00655965,	0.01330373,	0.00655965,	0.00078633,	0.00002292],
				[0.00019117,	0.00655965,	0.05472157,	0.11098164,	0.05472157,	0.00655965,	0.00019117],
				[0.00038771,	0.01330373,	0.11098164,	0.22508352,	0.11098164,	0.01330373,	0.00038771],
				[0.00019117,	0.00655965,	0.05472157,	0.11098164,	0.05472157,	0.00655965,	0.00019117],
				[0.00002292,	0.00078633,	0.00655965,	0.01330373,	0.00655965,	0.00078633,	0.00002292],
				[0.00000067,	0.00002292,	0.00019117,	0.00038771,	0.00019117,	0.00002292,	0.00000067]];
				*/
		
// 		let imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
// 		let result = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
// 		let d = imageData.data;
// 		let r = result.data;
// 		let offset = Math.floor(matrix.length / 2);
// 		let radius = 1.5;
// 		let times = 10;
// 		for (let i = 0; i < d.length; i++) {
// 			let t = 0;
// 			for (let y = offset*-4; y <= offset*4; y += 4) {
// 				for (let x = offset*-4; x <= offset*4; x += 4) {
// 					let loc = i + x;
// 					if (Math.floor(i/5) != Math.floor(loc/5))
// 						loc = i; //loc moved rows, put it back.
// 					let temp = loc;
// 					loc += y*this.canvas.width;
// 					if (loc < 0 || loc > d.length-1)
// 						loc = temp;
// 					if (i < times) {
// 						this.debug(i+':'+loc+':'+d[loc]+':'+t);
// 					}
// 					t += d[loc] * matrix[x/4+offset][y/4+offset];
// //					t += 1 / (Math.sqrt(2 * Math.PI) * deviation) * Math.exp(-(i - half) * (i - half) / (2 * deviation * deviation));
// 				}
// 			}
// 			r[i] = Math.round(t);
// 			if (isNaN(r[i])) {
// 				this.debug('NaN:'+i);
// 			}
//
// 		}
// 		this.debug('blur done');
// //		this.debug(d);
// //		this.debug(r);
// 		this.context.putImageData(result, 0, 0);
	}
	
	gaussianKernel(deviation) {
		let matrix = [];
		
//		let a = -2.0 * radius * radius / Math.log(radius);
//		this.debug(a);
		let size = Math.ceil(deviation)*8+1;
		let center = Math.ceil(deviation)*4;
		size = 21;
		center = 11;
		let sum = 0;
		for(let y=-100; y <= 100; y++) {
			matrix [y+100] = [];
			for (let x=-100; x <= 100; x++) {
//				let dist = Math.sqrt((x - center) * (x - center) + (y - center) * (y - center));
//				matrix[y+10][x+10] = ((1 / (Math.sqrt(2 * Math.PI) * deviation)) * Math.exp((-dist*dist)/(2*deviation*deviation)))/2.5;
				matrix[y+100][x+100] = (1 / (2 * Math.PI * deviation * deviation)) * Math.exp((x*x + y*y) / (-2 * deviation *deviation));
				sum += matrix[y+100][x+100];
//				matrix[y][x] = Math.exp(-dist * dist / a);
			}
		}
		this.debug(sum);
		return matrix;
	}
	
	// dir is the direction of the blur. x or y
	// speed (m*n) http://web.archive.org/web/20060718054020/http://www.acm.uiuc.edu/siggraph/workshops/wjarosz_convolution_2001.pdf
	motionBlur(amt, dir) {
        let outerInc;
        let outerStop; // exclusive
        let innerInc;
        let innerStop; // exclusive
		if (dir == 'y') {
            outerInc = 4;
            outerStop = this.canvas.width * 4; // exclusive
            innerInc = this.canvas.width * 4;
            innerStop = this.canvas.height * innerInc; // exclusive
		} else { // dir == x
            outerInc = this.canvas.width * 4;
            outerStop = this.canvas.height * outerInc; // width * height * 4 (exclusive)
            innerInc = 4;
            innerStop = this.canvas.width * 4; // exclusive
		}
		
		//let imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		//let d = imageData.data;
		let d = this.data;
		let result = this.context.createImageData(this.imageData);
		let r = result.data;

		let steps = 0;
		
		for (let i = 0; i < outerStop; i += outerInc) {
			let blured = {r:0, g:0, b:0, a:0}; // sum of blur
            let bluredN;
			// prime left half and center of the blured object
			for (bluredN = 0; bluredN <= amt; bluredN++) {
				blured.r += d[i];
				blured.g += d[i+1];
				blured.b += d[i+2];
				blured.a += d[i+3];
			}
			// prime right half of blured object
			// TODO: add constraint
			for (let j=1; bluredN < amt*2+1; bluredN++, j++) {
				blured.r += d[i+j*innerInc];
				blured.g += d[i+j*innerInc +1];
				blured.b += d[i+j*innerInc +2];
				blured.a += d[i+j*innerInc +3];
			}
//			this.debug('primed '+ bluredN +':'+blured.r);
			// burendN now == amt*2+1
			// run regular inner loop
			for (let j = 0; j < innerStop; j += innerInc) {
				r[i+j] = Math.round(blured.r/bluredN);
				r[i+j+1] = Math.round(blured.g/bluredN);
				r[i+j+2] = Math.round(blured.b/bluredN);
				r[i+j+3] = Math.round(blured.a/bluredN);
				
				let f = this.constrain(i+j+amt*innerInc+innerInc, i, i+innerStop-innerInc);
				let b = this.constrain(i+j-amt*innerInc, i, i+innerStop-innerInc);
				if (steps < 1) {
//					this.debug((i+j) +','+ b +',' + f);
//					this.debug(blured.r +','+ (blured.r/bluredN) +':'+ d[b] +','+ d[f]);
				}
				// While it would be clever to reference the current pixel as the blured object, but that gets confusing.
				blured.r += d[f];
				blured.r -= d[b];
				blured.g += d[f+1];
				blured.g -= d[b+1];
				blured.b += d[f+2];
				blured.b -= d[b+2];
				blured.a += d[f+3];
				blured.a -= d[b+3];
				
				// add constrain(d[+amt*inc])
				// sub constrain(d[-amt*inc])
			}
			steps++;
		}
		
		//this.context.putImageData(result, 0, 0);
		this.data = r;
	}
	
	fastGaus(amt) {
		let d = new Date();
		let start = d.getTime();
		
		amt = Math.round((amt -.4) / 1.18);	// convert gaus amt to equivilent box blur amt (my equation from experimentation)
		this.debug('doing 4 box blurs at ' + amt);
		this.boxBlur(amt);
		this.boxBlur(amt);
		this.boxBlur(amt);
		this.boxBlur(amt);
		let d2 = new Date();
		
		this.displayImage();
		this.debug('blur took '+ (d2.getTime() - start)/1000 +' seconds');
	}
	
	boxBlur(amt) {
		this.motionBlur(amt, 'x');
		this.motionBlur(amt, 'y');
	}
	

	fastSharpen(amt) {
		amt = ( !isNaN(parseFloat(amt)) ) ? parseFloat(amt) : 2;
		let blurWeight = (amt-1) / 4;
		amt += blurWeight;
		this.debug(amt, blurWeight);
		// we need the original image to run against the blur.
		let orig = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height).data;

		// this technique may not be acurate in blur values that have been clamped.
		this.boxBlur(1);

		let d = this.data;
		for (let i = 0; i < d.length; i += 4) {
			d[i] = orig[i] * amt - d[i] * 5 * blurWeight;
			d[i+1] = orig[i+1] * amt - d[i+1] * 5 * blurWeight;
			d[i+2] = orig[i+2] * amt - d[i+2] * 5 * blurWeight;
		}
		this.displayImage();
	}
		
	// colors should be an array at least 2 color objects {pos, color}. 0 <= pos <= 1
	linearGradient(x0, y0, x1, y1, colors) {
		let grad = this.context.createLinearGradient(x0, y0, x1, y1);
		
		for (let i=0; i < colors.length; i++) {
			grad.addColorStop(colors[i].pos, colors[i].color);
		}
		this.context.fillStyle=grad;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}
	
	vignette(amt, rgb) {
		// maybe I could figure out a way to make vigImage a DOM style image instead of an imageData
		let vigImage = this.genVignette(amt, rgb);
		
		// TODO: double check that there is no memory leak here
//		let tempCanvas = document.createElement('canvas');
//		tempCanvas.getContext('2d').putImageData(vigImage, 0, 0);
		
		let d = this.data;
		let t = vigImage.data;
		for (let i = 0; i < d.length; i += 4) {
			d[i] = t[i]*t[i+3]/255 + d[i]*(255-t[i+3])/255; //red
			d[i+1] = t[i+1]*t[i+3]/255 + d[i+1]*(255-t[i+3])/255; //green
			d[i+2] = t[i+2]*t[i+3]/255 + d[i+2]*(255-t[i+3])/255; //blue
			d[i+3] = d[i+3] + t[i+3]; // alpha
			if (i < 4*10) this.debug(d[i+3], t[i+3]);
		}
		
		this.displayImage();

//		this.context.putImageData(vigImage, 0, 0);
		
//		this.context.drawImage(vigImage, 0, 0, this.canvas.width, this.canvas.height);
	}
	
	// takes a rgb color, and creates a vignette based on the amt to ramp the alpha from a circle that touches edges
	// returns a vignette imageData object
	genVignette(amt, rgb) {
		let vigImage = this.context.createImageData(this.imageData);
		let d = vigImage.data;
		
		let a = 255;
		let dist;
		let circleW = this.canvas.width/2;
		let circleH = this.canvas.height/2;
		let amtDec = amt/255; //amount adjusted to decimal.
		this.debug(amt, amtDec);
		
		let i = 0; // i is index into the array based on x,y
		for (let y = 0; y < this.canvas.height; y++) {
			for (let x = 0; x < this.canvas.width; x++) {
				i = y*this.canvas.width*4 + x*4;
				dist = Math.sqrt( ( ((x-circleW)*(x-circleW))/(circleW*circleW) ) + ( ((y-circleH)*(y-circleH))/(circleH*circleH) ) );
//				if (y < 1) this.debug(x, dist, 1-amtDec, 1+amtDec, this._ramp(dist, 1-amtDec, 1+amtDec, 0, 255));
				
				d[i] = rgb.r; //red
				d[i+1] = rgb.g; //green
				d[i+2] = rgb.b; //blue
				d[i+3] = this._ramp(dist, 1-amtDec, 1+amtDec, 0, 255);
			}
		}
		return vigImage;
	}
	
	// from is the bottom of the input range that is to be mapped to min
	// to is the top of the input range that is to be mapped to max
	_ramp(input, from, to, min, max) {
		if (input <= from)
			return min;
		if (input >= to)
			return max;
		let ratio = (max - min) / (to - from);
		return (input - from) * ratio + min;
	}
	
	debug(...args : any[]) {
		if (!this.debuging) return;

		let str = '';
		for (let i = 0; i < args.length; i++) {
			str += args[i] + ':';
		}
		console.log(args);
		//console.log(str.slice(0, -1));
	}
	
}

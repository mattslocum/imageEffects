var myImage,topImage;
jQuery(function($) {
	$('button').click(function(e) { e.preventDefault(); });
	
	$('#imageFile').click(function() {
		myImage = new imageEffects({
			container: "imageEffects",
			src: 'Jeffers.jpg' 
//			src: 'squares.png' 
		});
		topImage = new imageEffects({
			src: 'top2.jpg' 
		});
	});
	$('#viewImage').click(function() {
		document.location = myImage.toDataURL();
	});
	
	$('#invert').click(function() {
		myImage.invert();
		topImage.invert();
	});
	$('#desaturate').click(function() {
		myImage.desaturate();
	});
	$('#threshold').click(function() {
		myImage.threshold( prompt('Enter Threshold Amount', 127) );
	});
	$('#brightness').click(function() {
		myImage.brightness( prompt('Enter Brightness Amount', 10) );
	});
	$('#contrast').click(function() {
		myImage.contrast( prompt('Enter Contrast Amount', 10) );
	});
	$('#fastGaus').click(function() {
		var amt = prompt('Enter Blur Amount', 3);
		if (!amt) return;
		myImage.fastGaus( amt );
	});
	$('#blur').click(function() {
		var amt = prompt('Enter Blur Amount', 3);
		if (!amt) return;
		myImage.boxBlur( amt );
		myImage.displayImage();
	});
	$('#sharpen').click(function() {
		var amt = prompt('Enter Sharpen Amount', 5);
		if (!amt) return;
		myImage.fastSharpen( amt );
	});
	$('#convolve').click(function() {
		myImage.convolve( );
	});
	$('#tint').click(function() {
		var rgb = RGBtoObj($('#colorAdj').css('backgroundColor'));
		myImage.tint( rgb.r, rgb.g, rgb.b );
	});
	$('#linearGradient').click(function() {
		var rgb = RGBtoObj($('#colorAdj').css('backgroundColor'));
		var endColor = 'rgba('+ rgb.r +','+ rgb.g +','+ rgb.b +','+ 0 +')';
		myImage.linearGradient( 0, 0, 500, 0, [{pos:0, color:$('#colorAdj').css('backgroundColor')}, {pos: 1, color: endColor}]);
	});
	$('#vignette').click(function() {
		var amt = prompt('Enter Vignette Amount', 20);
		if (!amt) return;
		var rgb = RGBtoObj($('#colorAdj').css('backgroundColor'));
		myImage.vignette(amt, rgb);
	});
	$('#blend').click(function() {
		myImage[$('#blendMode').val()]( topImage );
	});
	
	$('#imageEffects').click(function(e) {
		var pos = $(this).position();
		var pix = myImage.getPixel(myImage.imageData, e.pageY - pos.top, e.pageX - pos.left);
		console.log(e.pageY - pos.top, e.pageX - pos.left, pix);
		$('#colorAdj').css('backgroundColor', 'rgb('+pix.r +','+ pix.g +','+ pix.b +')');
	});
	
	$('#colorAdj').ColorPicker({
		color: '#000000',
		onBeforeShow: function () {
			$(this).ColorPickerSetColor(RGBToHex($(this).css('backgroundColor')));
		},
		onShow: function (colpkr) {
			$(colpkr).fadeIn(500);
			return false;
		},
		onHide: function (colpkr) {
			$(colpkr).fadeOut(500);
			return false;
		},
		onChange: function (hsb, hex, rgb) {
			$('#colorAdj').css('backgroundColor', '#' + hex);
		},
		onSubmit: function(hsb, hex, rgb, el) {
			$('#colorAdj').css('backgroundColor', '#' + hex);
		}
	});
	
	
	// accepts rgb formatted color as rgba(#, #, #)
	// returns 6 character hex value without leading '#'
	function RGBToHex(rgb) {
		//http://stackoverflow.com/questions/638948/background-color-hex-to-javascript-variable-jquery
		var parts = rgb.match(/^rgba*\((\d+),\s*(\d+),\s*(\d+)/);
		// parts now should be ["rgb(#, #, #)", "#", "#", "#"]
		if (!parts)
			return 0;
		
		parts.splice(0,1);
		for (var i=0; i < parts.length; ++i) {
			parts[i] = parseInt(parts[i]).toString(16);
			if (parts[i].length == 1) 
				parts[i] = '0' + parts[i];
		}
		return parts.join('').toUpperCase();
	}
	function RGBtoObj(rgb) {
		var parts = rgb.match(/^rgba*\((\d+),\s*(\d+),\s*(\d+)/);
		if (!parts)
			return 0;
		return { r: parseInt(parts[1]), 
				g: parseInt(parts[2]), 
				b: parseInt(parts[3])
		};
	}

	
});
function readURL(input) {

	if (input.files && input.files[0]) {

		var reader = new FileReader();
		var number = input.name.replace('picture', '');
		var filename = input.value.split(/(\\|\/)/g).pop();

		reader.onload = function(e) {

			var fileSelector = document.getElementById("pName" + number);
			
			if(fileSelector){
				fileSelector.value = filename;
			}

			var id = '#preview' + number;

			$(id).attr('src', e.target.result);
		}
		reader.readAsDataURL(input.files[0]);
	}
}
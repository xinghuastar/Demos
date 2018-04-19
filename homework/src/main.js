		var vmResource = function(name, type, url){
			this.name = name;
			this.type = type;
			this.url = url;
			this.status = url.split('|')[1];
		};
		
		function CruisePanel(arrObj){
				this.vmResArr = [];
				var o1 = new vmResource('bjstdmngbgr02.thoughtworks.com', ['ubuntu', 'firefox3', 'core-duo'], '|idle|192.168.1.2|/var/lib/cruise-agent');
				var o2 = new vmResource('bjstdmngbgr03.thoughtworks.com', ['ubuntu', 'firefox3', 'mysql', 'core-duo'], '|building|192.168.1.3|/var/lib/cruise-agent');
				var o3 = new vmResource('bjstdmngbgr04.thoughtworks.com', ['ubuntu', 'firefox3', 'mysql', 'core-duo'], '|building|192.168.1.4|/var/lib/cruise-agent');
				var o4 = new vmResource('bjstdmngbgr05.thoughtworks.com', ['ubuntu'], '|idle|192.168.1.5|/var/lib/cruise-agent');
				this.vmResArr.push(o1);
				this.vmResArr.push(o2);
				this.vmResArr.push(o3);
				this.vmResArr.push(o4);
				var numOfIdle = 0;
				var numOfBuilding = 0;
				for(var i=0;i<this.vmResArr.length;i++){
					if(this.vmResArr[i].status == "idle"){
						numOfIdle++;
					}else{
						numOfBuilding++;
					}
				}
				this.numOfIdle = numOfIdle;
				this.numOfBuilding = numOfBuilding;
				
				// for extension, use arrObj
				
			}
			
		CruisePanel.prototype.render = function(divContainer){
			var content = '';
			for(var i=0;i<this.vmResArr.length;i++){
				var res = this.vmResArr[i];
				var rowId = "row" + i;
				var statusCss = res.status == 'idle' ? 'idleCss' : 'buildingCss';
				content += "<div class='listItem " + statusCss + "'>" +
									"<div class='circle'></div>" +
										"<span class='resName inlineItem'>" +
											res.name +
										"</span>" +
									"<div class='resUrl inlineItem'>" +
											res.url +
									"</div>" +
										"<div class='resType' id='" + rowId + "'><span class='inlineItem'> + </span>" +
									"<a id='" + i + "'  onclick='addTypeItem(" + i + ")' class='inlineItem addTypeLink'>Specify Resources</a>";

				
				for(var j=0;j<res.type.length;j++){
					var id = "item" + i + '' + j;
					
					content += "<div class='inlineItem resTypeItem'>" + res.type[j] + "</div><input type='button' id='" + id + "' onclick='deleteTypeItem(" + id + ")' class='inlineItem xbutton' value='x'></input>";		
				}
				// end of resType div
				content += "</div>";
				// add resType div
				var blockId = "block" + i;
				var inputId = "text" + i;
				var addBtnId = "addBtn" + i;

				content += "<div id='" + blockId + "' class='addTypeBlock'><span>(separate multiple resources name with commas)</span><br><input class='blockInput' type='text' id='" + inputId + "'><br>";

				content += "<input type='button' class='radius-button' value='Add resources' onclick='submitAdd(" + inputId + "," + rowId + "," + blockId + ")'><input type='button' onclick='closeCurrentBlock(" + blockId + ")' class='radius-button' value='Close'></div>";

				// add Deny tag for idle type of resource
				if(this.vmResArr[i].status == 'idle'){
					content += "<a class='denyLink'><img src='forbidden.png'>Deny</a>";
				}

				// end of whole list item
				content += "</div>";
			
			}
			divContainer.innerHTML = content;

			// render right pane
			document.getElementById('numIdle').innerText = this.numOfIdle;
			document.getElementById('numBuilding').innerText = this.numOfBuilding;
		
		};

		var addTypeItem = function(id) {
			var block = document.getElementById("block" + id);
			block.style.display = 'block';
		};

		var submitAdd = function(inputId, rowId, blockId) {
			var value = inputId.value;
			var newTypeArr = value.split(',');

			var row = inputId.id.charAt(inputId.id.length - 1);
			

			// find resType and add several childNodes
			var resTypeDiv = rowId;

			for(var i=0;i<newTypeArr.length;i++){
				var btnId = '';
				var newItem = document.createElement("div");
				newItem.className = "inlineItem resTypeItem";
				newItem.innerText = newTypeArr[i];
				resTypeDiv.appendChild(newItem);

				var newXBtn = document.createElement("input");
				newXBtn.type = "button";
				btnId = "item" + row + '' + (this.cruise.vmResArr[row].type.length + i);
				newXBtn.className = "inlineItem xbutton";
				newXBtn.value = "x";
				var self = this;
				newXBtn.onclick = function(id){
					return function(){
						self.deleteTypeItem(document.getElementById(id));
					};
				}(btnId);
				newXBtn.id = btnId;
				resTypeDiv.appendChild(newXBtn);
			}

			this.cruise.vmResArr[row].type = this.cruise.vmResArr[row].type.concat(newTypeArr);

			blockId.style.display = "none";

			

		};

		var deleteTypeItem = function(item) {
			
			var selectedXButton = item;
			var selectedTypeItem = selectedXButton.previousSibling;

			var parentNode = selectedTypeItem.parentNode;
			parentNode.removeChild(selectedTypeItem);
			parentNode.removeChild(selectedXButton);

			var x = item.id.charAt(item.id.length - 2);
			var y = item.id.charAt(item.id.length - 1);

			this.cruise.vmResArr[x].type.splice(y, 1);
			
		};

		var closeCurrentBlock = function(blockId) {
			blockId.style.display = 'none';
		};
		window.onload = function(){
			var container = document.getElementById("leftColumn");
			if(container){
				this.cruise = new CruisePanel(container);
				this.cruise.render(container);
			}
			
			
		};
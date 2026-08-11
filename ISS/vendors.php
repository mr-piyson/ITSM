<?php
  include "header.php";
  if(isset($_SESSION['ISStoken']) && !empty($_SESSION['ISStoken'])){
    $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
    if ($mysqli->connect_errno) {
      die("connectionFailed");
    }
    $token = $_SESSION['ISStoken'];
    $input1 = mysqli_real_escape_string($mysqli, $token);
    $sql = "SELECT * FROM `users` WHERE `token` = '".$input1."'";
    if(!$result = $mysqli->query($sql)){
      $mysqli->close();
      die("queryFailed");
    }
    if ($result->num_rows === 0){
      unset($_SESSION['ISStoken']);
      die("<meta http-equiv='refresh' content='0;url=index.php' />");
    }else{
      $row = $result->fetch_array(MYSQLI_ASSOC);
      date_default_timezone_set('Asia/Bahrain');
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      ?>

      <script>
        var vendorNames = [];
        var vendorsNotes = [];
        var vendorsIDs = [];
        var selectedVendorID;
        function showUpdateModel(counter,vendorID){
          selectedVendorID = vendorID;
          document.getElementsByName("vendorName")[0].value = vendorNames[counter];
          document.getElementsByName("vendorNote")[0].value = vendorsNotes[counter];
          document.getElementById("updateHeaderDiv").innerHTML = "Loading ...";
          document.getElementsByName("contactType")[0].value = "mobile";
          document.getElementsByName("contactName")[0].value = "";
          document.getElementsByName("contactPositon")[0].value = "";
          document.getElementsByName("contactValue")[0].value = "";
          document.getElementById('moreContactDiv').innerHTML = "";
          document.getElementById("updateHeaderDiv").style.display = "block";
          document.getElementById("updateVendorDiv").style.display = "none";
          document.getElementById('updateVendorModel').style.display='block';
          var xhr = new XMLHttpRequest();
          xhr.open("POST", 'getVendorContacts.php', true);
          xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          xhr.onreadystatechange = function() {
            if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
              document.getElementById("updateHeaderDiv").style.display = "none";
              document.getElementById("updateVendorDiv").style.display = "block";
              if(xhr.responseText != "none"){
                let respObj = JSON.parse(xhr.responseText);
                for (let i=0;i<respObj.length;i++){
                  if(i > 0){
                    addMoreContact();
                  }
                  document.getElementsByName("contactType")[i].value = respObj[i].contactType;
                  document.getElementsByName("contactName")[i].value = respObj[i].contactName;
                  document.getElementsByName("contactPositon")[i].value = respObj[i].personPosition;
                  document.getElementsByName("contactValue")[i].value = respObj[i].contact;
                }
              }
            }
          }
          xhr.send("vendorID="+vendorID);
        }
        function searchClicked(e) {
          if ((document.getElementById('searchInput').value.trim().length > 1)){
            document.getElementById("defaultSearch").style.display = "none";
            document.getElementById("resultSearchList").style.display = "block";
            document.getElementById("resultSearchList").innerHTML = "";
            for (var i=0;i<vendorNames.length;i++) {
              if (vendorNames[i].toUpperCase().includes(document.getElementById("searchInput").value.trim().toUpperCase()) ||
              vendorsNotes[i].toUpperCase().includes(document.getElementById("searchInput").value.trim().toUpperCase())){
                document.getElementById("resultSearchList").innerHTML = document.getElementById("resultSearchList").innerHTML + `
                <div class='w3-half w3-padding'><div class='w3-padding w3-margin-top vendorResultElement' style='background:#f9f9f9;height:200px;overflow:auto;'>
                <a onclick='showUpdateModel(`+i+`,`+vendorsIDs[i]+`)' class='w3-right w3-btn w3-border w3-white'>Update</a>
                <h4 style='margin:0px;color:#0b5266;'>`+vendorNames[i]+`</h4>
                <p class='w3-text-grey' style='margin:0px;'><b>`+vendorsNotes[i]+`</b></p>
                </div></div>`;
              }
            }
          }else{
            document.getElementById("resultSearchList").innerHTML = "";
            document.getElementById("resultSearchList").style.display = "none";
            document.getElementById("defaultSearch").style.display = "block";
          }
        }
        function addMoreContact(){
          let contactType = [];
          let contactName = [];
          let contactPositon = [];
          let contactValue = [];
          for (let i=0;i<document.getElementsByName('contactType').length;i++){
            if(i != 0){
              contactType.push(document.getElementsByName('contactType')[i].value);
              contactName.push(document.getElementsByName('contactName')[i].value);
              contactPositon.push(document.getElementsByName('contactPositon')[i].value);
              contactValue.push(document.getElementsByName('contactValue')[i].value);
            }
          }
          document.getElementById("moreContactDiv").innerHTML=document.getElementById("moreContactDiv").innerHTML + `
          <div id="cn`+document.getElementsByName('contactType').length+`" class="w3-row w3-margin-top">
            <div class="w3-col m2">
              <select name="contactType" class="w3-select w3-padding w3-border w3-white" style="height:40px;">
                <option value="mobile">mobile</option>
                <option value="email">email</option>
                <option value="other">other</option>
              </select>
            </div>
            <div class="w3-col m3" style="padding-left:5px;">
              <input class="w3-input w3-border" type="text" name="contactPositon" maxlength="100" placeholder="position">
            </div>
            <div class="w3-col m3" style="padding-left:5px;">
              <input class="w3-input w3-border" type="text" name="contactName" maxlength="100" placeholder="name">
            </div>
            <div class="w3-col m3" style="padding-left:5px;">
              <input class="w3-input w3-border" type="text" name="contactValue" maxlength="100" placeholder="value">
            </div>
            <div class="w3-col m1 removebtns2" style="padding-left:5px;height:40px;">
              <a onclick='removeContact(`+document.getElementsByName('contactType').length+`)' class='w3-tag w3-red' style='cursor:pointer;height:22px;margin-top:9px;'>X</a>
            </div>
          </div>
          `;
          for (let i=0;i<document.getElementsByName('contactType').length - 1;i++){
            if(i != 0){
              document.getElementsByName('contactType')[i].value=contactType[i-1];
              document.getElementsByName('contactName')[i].value=contactName[i-1];
              document.getElementsByName('contactPositon')[i].value=contactPositon[i-1];
              document.getElementsByName('contactValue')[i].value=contactValue[i-1];
            }
          }
          for (var x=0;x<document.getElementsByClassName('removebtns2').length;x++){
            document.getElementsByClassName('removebtns2')[x].style.display = "none";
          }
          document.getElementsByClassName('removebtns2')[document.getElementsByClassName('removebtns2').length - 1].style.display = "inline-block";
        }
        function removeContact(index){
          document.getElementById("cn"+index).remove();
          for (var x=0;x<document.getElementsByClassName('removebtns2').length;x++){
            document.getElementsByClassName('removebtns2')[x].style.display = "none";
          }
          if(document.getElementsByClassName('removebtns2').length > 0){
            document.getElementsByClassName('removebtns2')[document.getElementsByClassName('removebtns2').length - 1].style.display = "inline-block";
          }
        }
        function updateVendorSubmitted(){
          if(document.getElementsByName('vendorName')[0].value.trim().length < 1){
            alert("Please fill vendor's name !");
          }else{
            document.getElementById("updateDiv").innerHTML = "<h3 class='w3-margin-top w3-center'>Loading ...</h3>";
            document.getElementById("deleteDiv").innerHTML = "";
            var formData = new FormData();
            formData.append("name", document.getElementsByName('vendorName')[0].value.trim());
            formData.append("notes", document.getElementsByName('vendorNote')[0].value.trim());
            for (let i=0;i<document.getElementsByName('contactType').length;i++){
              if(document.getElementsByName('contactName')[i].value.trim().length > 0 && document.getElementsByName('contactValue')[i].value.trim().length > 0){
                formData.append("contactType[]", document.getElementsByName('contactType')[i].value.trim());
                formData.append("contactName[]", document.getElementsByName('contactName')[i].value.trim());
                formData.append("contactPositon[]", document.getElementsByName('contactPositon')[i].value.trim());
                formData.append("contactValue[]", document.getElementsByName('contactValue')[i].value.trim());
              }
            }
            formData.append("user", "<?php echo $row['id']; ?>");
            formData.append("vendorID", selectedVendorID);
            if(document.getElementById('vendorImage').files.length > 0){
              formData.append("file", document.getElementById('vendorImage').files[0]);
            }

            var xhr = new XMLHttpRequest();
            xhr.open("POST", 'updateVendor.php', true);
            xhr.onreadystatechange = function() {
              if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                document.getElementById("updateHeaderDiv").style.display = "block";
                document.getElementById("updateVendorDiv").style.display = "none";
                if(xhr.responseText == "updated"){
                  document.getElementById("updateHeaderDiv").innerHTML = "<h3 class='w3-margin-top w3-center w3-green'>Updated Successfully!</h3>";
                  setTimeout(function(){
                    location.reload();
                  }, 1000);
                }else{
                  document.getElementById("updateHeaderDiv").innerHTML = "<h3 class='w3-margin-top w3-center w3-red'>Failed</h3>";
                }
              }
            }
            xhr.send(formData);
          }
        }
        function deleteVendorSubmitted(){
          document.getElementById("updateDiv").innerHTML = "";
          document.getElementById("deleteDiv").innerHTML = "<h3 class='w3-margin-top w3-center'>Loading ...</h3>";
          var xhr = new XMLHttpRequest();
          xhr.open("POST", 'deleteVendor.php', true);
          xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          xhr.onreadystatechange = function() {
            if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
              document.getElementById("updateHeaderDiv").style.display = "block";
              document.getElementById("updateVendorDiv").style.display = "none";
              if(xhr.responseText == "deleted"){
                document.getElementById("updateHeaderDiv").innerHTML = "<h3 class='w3-margin-top w3-center w3-green'>Deleted Successfully!</h3>";
                setTimeout(function(){
                  location.reload();
                }, 1000);
              }else{
                document.getElementById("updateHeaderDiv").innerHTML = "<h3 class='w3-margin-top w3-center w3-red'>Failed</h3>";
              }
            }
          }
          xhr.send("vendorID="+selectedVendorID+"&user=<?php echo $row['id']; ?>");
        }
      </script>

      <div class="w3-container">
        <h1 class="w3-padding title">Vendors</h1>
        <div class="w3-padding">
          <a href='newVendor.php' class='w3-btn w3-border w3-small'>Add new vendor</a>
        </div>
        <div class="w3-container w3-margin-top">
          <input onkeyup="searchClicked(event)" id="searchInput" placeholder="search name/notes" class="w3-input w3-border" type="text">
        </div>
        <div>
          <div id="resultSearchList" class="w3-ul w3-small w3-margin-top" style="display:none;"></div>
          <div id="defaultSearch" class="w3-ul w3-small w3-margin-top">
              <div>
                <?php
                  $sql2 = "SELECT * FROM `vendors` WHERE `inActive` = 0";
                  if(!$result2 = $mysqli->query($sql2)){
                    die("queryFailed");
                  }
                  if ($result2->num_rows === 0){
                    echo "no vendors";
                  }else{
                    echo "<div class='w3-row'>";
                    $counter = 0;
                    while($row2 = $result2->fetch_assoc()){
                      $Vnotes = $row2['notes'];
                      $Vnotes = str_replace(array("\r", "\n"), '', $Vnotes);
                      ?>
                        <script>
                          vendorNames.push("<?php echo $row2['name'];?>");
                          vendorsNotes.push("<?php echo $Vnotes;?>");
                          vendorsIDs.push("<?php echo $row2['id'];?>");
                        </script>
                      <?php
                        echo "<div class='w3-half w3-padding'><div class='w3-padding w3-margin-top vendorResultElement' style='background:#f9f9f9;height:200px;overflow:auto;'>";
                        echo "<a onclick='showUpdateModel(".$counter.",".$row2['id'].")' class='w3-right w3-btn w3-border w3-white'>Update</a>";
                        if(!empty($row2['image'])){
                          echo "<img class='w3-right' style='max-width:30%;max-height:100%;margin-right:5px;' src='http://iss.bfginternational.com/ISS/itemsImages/".$row2['image']."' />";
                        }
                        echo "<h4 style='margin:0px;color:#0b5266;'>".$row2['name']."</h4>";
                        echo "<p class='w3-text-grey' style='margin:0px;'><b>".$row2['notes']."</b></p>";
                        $sql3 = "SELECT * FROM `vendorsContacts` WHERE `vendorID`=".$row2['id'];
                        if(!$result3 = $mysqli->query($sql3)){
                          die("queryFailed");
                        }
                        if ($result3->num_rows>0){
                          echo "<p class='w3-text-grey'>";
                          while($row3 = $result3->fetch_assoc()){
                            echo $row3["contactName"]." (".$row3['personPosition'].") ".$row3["contact"]."<br>";
                          }
                          echo "</p>";
                        }
                        echo "</div></div>";
                        $counter = $counter + 1;
                    }
                    echo "</div>";
                  }
                ?>
              </div>
          </div>
        </div>
      </div>

      <div id="updateVendorModel" class="w3-modal">
        <div class="w3-modal-content w3-animate-top">
          <div class="w3-container" style="height:650px;overflow:auto;background:#f9f9f9;">
            <div id="updateHeaderDiv" style="display:none" class="w3-container w3-margin"></div>
            <div id="updateVendorDiv" class="w3-container w3-margin">
              <h2 class="title">Update Vendor Details</h2>
              <p>
                <label>Name</label>
                <input name="vendorName" class="w3-input w3-border" type="text" maxlength="150">
              </p>
              <p>
                <label>Notes</label>
                <textarea class="w3-input w3-border" name="vendorNote" rows="3" cols="50"></textarea>
              </p>
              <p>
                <label>Image</label>
                <input id="vendorImage" class="w3-input w3-border" type="file" accept="image/*">
              </p>
              <p>
                <label>Contact</label>
                <div class="w3-row">
                  <div class="w3-col m2">
                    <select name="contactType" class="w3-select w3-padding w3-border w3-white" style="height:40px;">
                      <option value="mobile">mobile</option>
                      <option value="email">email</option>
                      <option value="other">other</option>
                    </select>
                  </div>
                  <div class="w3-col m3" style="padding-left:5px;">
                    <input class="w3-input w3-border" type="text" name="contactPositon" maxlength="100" placeholder="position">
                  </div>
                  <div class="w3-col m3" style="padding-left:5px;">
                    <input class="w3-input w3-border" type="text" name="contactName" maxlength="100" placeholder="name">
                  </div>
                  <div class="w3-col m3" style="padding-left:5px;">
                    <input class="w3-input w3-border" type="text" name="contactValue" maxlength="100" placeholder="value">
                  </div>
                </div>
              </p>
              <div id="moreContactDiv"></div>
              <a class="w3-small" onclick="addMoreContact()" style="text-decoration:underline;color:#0b5266;cursor:pointer;">+ add more</a>
              <div id="updateDiv">
                <a onclick="updateVendorSubmitted()" class="w3-margin-top w3-btn" style="background:#128cae;color:#fff;">UPDATE</a>
              </div>
              <div id="deleteDiv">
                <a onclick="deleteVendorSubmitted()" class="w3-margin-top w3-btn w3-brown">DELETE</a>
              </div>
            </div>
          </div>
          <div class="w3-container w3-light-grey w3-padding">
            <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('updateVendorModel').style.display='none'">Close</div>
          </div>
        </div>
      </div>

      <?php
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>

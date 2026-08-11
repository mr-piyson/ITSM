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
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      ?>
      <script>
        var nonStaffLastID;
        var allEmpArray = [];
        var employeeName = [];
        var employeeImages = [];
        var employeeID = [];
        function searchClicked(e) {
          if ((document.getElementById('searchInput').value.trim().length > 1)){
            document.getElementById("defaultSearch").style.display = "none";
            document.getElementById("default2Search").style.display = "none";
            document.getElementById("nonstaffTitle").style.display = "none";
            document.getElementById("staffTitle").style.display = "none";
            document.getElementById("resultSearchList").style.display = "block";
            document.getElementById("resultSearchList").innerHTML = "";
            var resultTable;
            resultTable = "<table class='w3-table w3-table-all'>";
            for (var i=0;i<employeeName.length;i++) {
              if (employeeName[i].toUpperCase().includes(document.getElementById("searchInput").value.trim().toUpperCase()) ||
              employeeID[i].toUpperCase().includes(document.getElementById("searchInput").value.trim().toUpperCase())){
                resultTable = resultTable + `
                <tr>
                <td><div class='empImages' data-background='url(http://iss.bfginternational.com/ISS/itemsImages/`+employeeImages[i]+`)'></div></td>
                <td style='vertical-align: middle;'>`+employeeID[i]+`</td>
                <td style='vertical-align: middle;'>`+employeeName[i]+`</td>
                <td style='text-align:right;vertical-align: middle;width:140px;'>
                <a href='ownerDetails.php?emp=`+employeeID[i]+`' class='w3-btn w3-small w3-border' style='padding:6px !important;'>Details</a>
                <a onclick=showEmpUpdate(`+employeeID[i]+`) style='text-align:right;padding:6px !important;' class='w3-btn w3-small w3-border'>Update</a>
                </td>
                </tr>
                `;
              }
            }
            resultTable = resultTable + "</table>";
            document.getElementById("resultSearchList").innerHTML = resultTable;
            for (let i=0;i<document.getElementsByClassName("empImages").length;i++){
              document.getElementsByClassName("empImages")[i].style.background = document.getElementsByClassName("empImages")[i].getAttribute("data-background");
              document.getElementsByClassName("empImages")[i].style.backgroundSize = "cover";
              document.getElementsByClassName("empImages")[i].style.backgroundPosition = "center";
            }
          }else{
            document.getElementById("resultSearchList").innerHTML = "";
            document.getElementById("resultSearchList").style.display = "none";
            document.getElementById("defaultSearch").style.display = "table";
            document.getElementById("default2Search").style.display = "table";
            document.getElementById("nonstaffTitle").style.display = "block";
            document.getElementById("staffTitle").style.display = "block";
          }
        }
        function staffTypeChanged(){
          if(document.getElementById("nonStaffRadio").checked){
            document.getElementById("staffIDInput").value = parseInt(nonStaffLastID);
            document.getElementById("staffIDInput").disabled = true;
          }else{
            document.getElementById("staffIDInput").value = "";
            document.getElementById("staffIDInput").disabled = false;
          }
        }
        function addNewClicked(){
          if(document.getElementById("staffNameInput").value.trim().length < 1){
            alert("Please fill name !");
          }else if(document.getElementById("staffRadio").checked && document.getElementById("staffIDInput").value.trim().length < 1){
            alert("Please fill ID !");
          }else{
            let postData;
            document.getElementById("addNewBtnDiv").innerHTML = "<h4>Loading ...</h4>";
            postData = "user=<?php echo $row['id']; ?>&name="+document.getElementById("staffNameInput").value;
            if(document.getElementById("nonStaffRadio").checked){
              postData = postData + "&empID="+nonStaffLastID;
            }else{
              postData = postData + "&empID="+document.getElementById("staffIDInput").value;
            }
            var xhr = new XMLHttpRequest();
            xhr.open("POST", 'addNewEmp.php', true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function() {
              if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                if(xhr.responseText == "added"){
                  document.getElementById("addNewBtnDiv").innerHTML = "<h3 class='w3-margin-top w3-center w3-green'>Added Successfully!</h3>";
                  setTimeout(function(){
                    location.reload();
                  }, 1000);
                }else if(xhr.responseText == "alreadyAdded"){
                  document.getElementById("addNewBtnDiv").innerHTML = "<h3 class='w3-margin-top w3-center w3-red'>Failed, Already Added</h3>";
                }else{
                  document.getElementById("addNewBtnDiv").innerHTML = "<h3 class='w3-margin-top w3-center w3-red'>Failed</h3>";
                }
              }
            }
            xhr.send(postData);
          }
        }
        function showEmpUpdate(empID){
          for (let i=0;i<allEmpArray.length;i++){
            if(allEmpArray[i].empID == empID){
              document.getElementById("updateStaffIDInput").value = allEmpArray[i].empID;
              document.getElementById("updateStaffNameInput").value = allEmpArray[i].name;
              document.getElementById("updateStaffEmailInput").value = allEmpArray[i].email;
            }
          }
          document.getElementById("updateEmpModal").style.display = "block";
        }
        function updateEmployeeSubmitted(){
          document.getElementById("updateDiv").innerHTML = "<h3 class='w3-margin-top w3-center'>Loading ...</h3>";
          document.getElementById("deleteDiv").innerHTML = "";

          var formData = new FormData();
          formData.append("empID", document.getElementById("updateStaffIDInput").value.trim());
          formData.append("name", document.getElementById("updateStaffNameInput").value.trim());
          formData.append("email", document.getElementById("updateStaffEmailInput").value.trim());
          formData.append("user", "<?php echo $row['id']; ?>");
          if(document.getElementById('empImage').files.length > 0){
            formData.append("file", document.getElementById('empImage').files[0]);
          }

          var xhr = new XMLHttpRequest();
          xhr.open("POST", 'updateEmployee.php', true);
          xhr.onreadystatechange = function() {
            if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
              document.getElementById("updateHeaderDiv").style.display = "block";
              document.getElementById("updateEmpDiv").style.display = "none";
              if(xhr.responseText == "added"){
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
        function deleteEmployeeSubmitted(){
          document.getElementById("updateDiv").innerHTML = "";
          document.getElementById("deleteDiv").innerHTML = "<h3 class='w3-margin-top w3-center'>Loading ...</h3>";
          var xhr = new XMLHttpRequest();
          xhr.open("POST", 'deleteEmployee.php', true);
          xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          xhr.onreadystatechange = function() {
            if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
              document.getElementById("updateHeaderDiv").style.display = "block";
              document.getElementById("updateEmpDiv").style.display = "none";
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
          xhr.send("empID="+document.getElementById("updateStaffIDInput").value.trim()+"&user=<?php echo $row['id']; ?>");
        }
        window.onload = function(){
          for (let i=0;i<document.getElementsByClassName("empImages").length;i++){
            document.getElementsByClassName("empImages")[i].style.background = document.getElementsByClassName("empImages")[i].getAttribute("data-background");
            document.getElementsByClassName("empImages")[i].style.backgroundSize = "cover";
            document.getElementsByClassName("empImages")[i].style.backgroundPosition = "center";
          }
        }
      </script>
      <style>
        .empImages{
          border-radius:25px;
          width:50px;
          height:50px;
          background-color:#eee;
        }
      </style>
      <div class="w3-container w3-padding" style="padding-bottom:40px !important;">
        <div class="w3-padding">
          <a class="w3-small w3-btn w3-border" href="home.php">BACK</a>
        </div>
        <div>
          <h1 class="w3-padding title">Employees</h1>
        </div>
        <div class="w3-container w3-margin-top">
          <input onkeyup="searchClicked(event)" id="searchInput" placeholder="Employee Name" class="w3-input w3-border" type="text" />
        </div>
        <?php
          $nonStaffArray = array();
          $staffTable = "<table id='defaultSearch' class='w3-table w3-table-all w3-margin-top'><tr><th></th><th>ID</th><th>Name</th><th></th></tr>";
          $nonStaffTable = "<table id='default2Search' class='w3-table w3-table-all w3-margin-top'><tr><th></th><th>ID</th><th>Name</th><th></th></tr>";
          $sql2 = "SELECT * FROM `employees` WHERE `inActive`=0 ORDER BY `empID`";
          if(!$result2 = $mysqli->query($sql2)){
            $mysqli->close();
            die("queryFailed");
          }
          if ($result2->num_rows > 0){
            while($row2 = $result2->fetch_assoc()){
              echo "<script>employeeName.push('".$row2['name']."');</script>";
              echo "<script>employeeID.push('".$row2['empID']."');</script>";
              echo "<script>employeeImages.push('".$row2['image']."');</script>";
              $image = "<div style='border-radius:25px;width:50px;height:50px;background-color:#eee;'></div>";
              if(!empty($row2['image'])){
                $image = "<div class='empImages' data-background='url(http://iss.bfginternational.com/ISS/itemsImages/".$row2['image'].")'></div>";
              }
              if(intval($row2["empID"]) > 100000){
                $nonStaffTable = $nonStaffTable . "<tr>
                <td>".$image."</td><td style='vertical-align: middle;'>".$row2['empID']."</td>
                <td style='vertical-align: middle;'>".$row2['name']."</td>
                <td style='text-align:right;vertical-align: middle;'>
                  <a href='ownerDetails.php?emp=".$row2['empID']."' class='w3-btn w3-small w3-border' style='padding:6px !important;'>Details</a>
                  <a onclick=showEmpUpdate(".$row2['empID'].") class='w3-btn w3-small w3-border' style='padding:6px !important;'>Update</a>
                </td>
                </tr>";
                $nonStaffArray[] = $row2['empID'];
              }else{
                $staffTable = $staffTable ."<tr>
                <td>".$image."</td><td style='vertical-align: middle;'>".$row2['empID']."</td>
                <td style='vertical-align: middle;'>".$row2['name']."</td>
                <td style='text-align:right;vertical-align: middle;width:140px;'>
                  <a href='ownerDetails.php?emp=".$row2['empID']."' class='w3-btn w3-small w3-border' style='padding:6px !important;'>Details</a>
                  <a onclick=showEmpUpdate(".$row2['empID'].") style='text-align:right;padding:6px !important;' class='w3-btn w3-small w3-border'>Update</a>
                </td>
                </tr>";
              }
              echo "<script>allEmpArray.push({empID:".$row2['empID'].",name:'".$row2['name']."',email:'".$row2['email']."'})</script>";
            }
            $nonStaffTable = $nonStaffTable . "</table>";
            $staffTable = $staffTable . "</table>";
            $newID = intval(end($nonStaffArray)) + 1;
            echo "<script>nonStaffLastID = '".$newID."'</script>";
        ?>
        <div class='w3-row'>
          <div class="w3-third" style="padding-left: 16px;">
            <div class="w3-light-grey w3-padding" style="margin-top:8px;">
              <h3 style="color:#303030;">Add New</h3>
              <div class="w3-padding" style="color:#303030;">
                <input id="staffRadio" onchange="staffTypeChanged()" class="w3-radio" type="radio" name="staff[]" checked> Staff
                <input id="nonStaffRadio" onchange="staffTypeChanged()" class="w3-radio w3-margin-left" type="radio" name="staff[]"> nonStaff
                <p>
                  <label>ID</label>
                  <input id="staffIDInput" class="w3-input w3-border" type="number">
                </p>
                <p>
                  <label>Name</label>
                  <input id="staffNameInput" class="w3-input w3-border" type="text">
                </p>
                <div id="addNewBtnDiv">
                  <p>
                    <input onclick="addNewClicked()" class="w3-btn" type="submit" value="ADD" style="background:#128cae;color:#fff;width:100px;">
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="w3-twothird">
            <div id="resultSearchList" class="w3-half" style="padding-left: 16px;display:none;margin-top: 8.5px"></div>
            <div class="w3-row">
              <div class='w3-half w3-padding' style="padding-right: 8px !important;">
                <div id="nonstaffTitle" class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                  <i>nonStaff</i>
                </div>
                <?php echo $nonStaffTable; ?>
              </div>
              <div class="w3-half w3-padding" style="padding-left: 8px !important;">
                <div id="staffTitle" class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                  <i>Staff</i>
                </div>
                <?php echo $staffTable; ?>
              </div>
            </div>
          </div>
        </div>
        <?php
          }
        ?>
        </div>

        <div id="updateEmpModal" class="w3-modal">
          <div class="w3-modal-content w3-animate-top">
            <div class="w3-container" style="height:550px;overflow:auto;background:#f9f9f9;">
              <div id="updateHeaderDiv" style="display:none" class="w3-container w3-margin"></div>
              <div id="updateEmpDiv" class="w3-container w3-margin">
                <h2 class="title">Update Employee</h2>
                <div>
                  <p>
                    <label>ID</label>
                    <input id="updateStaffIDInput" class="w3-input w3-border" type="number" disabled>
                  </p>
                  <p>
                    <label>Name</label>
                    <input id="updateStaffNameInput" class="w3-input w3-border" type="text">
                  </p>
                  <p>
                    <label>Email</label>
                    <input id="updateStaffEmailInput" class="w3-input w3-border" type="text">
                  </p>
                  <p>
                    <label>Image</label>
                    <input id="empImage" class="w3-input w3-border" type="file" accept="image/*">
                  </p>
                </div>
                <div id="updateDiv">
                  <a onclick="updateEmployeeSubmitted()" class="w3-margin-top w3-btn" style="background:#128cae;color:#fff;width:110px;">UPDATE</a>
                </div>
                <div id="deleteDiv">
                  <a style="width:110px;" onclick="deleteEmployeeSubmitted()" class="w3-margin-top w3-btn w3-brown">DEACTIVE</a>
                </div>
              </div>
            </div>
            <div class="w3-container w3-light-grey w3-padding">
              <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('updateEmpModal').style.display='none'">Close</div>
            </div>
          </div>
        </div>
        <?php
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>

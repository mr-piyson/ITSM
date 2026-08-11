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
      die("meta http-equiv='refresh' content='0;url=index.php' />");
    }else{
      $row = $result->fetch_array(MYSQLI_ASSOC);
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      ?>

      <script>
      var changeRequestID = [];
      var newPage = [];
      var description = [];
      var exsistingPage = [];
      var pageName = [];
      var modification = [];
      var exampleIMG = [];
      function setpageType(){
        if(document.getElementById("pageType").value == 'new'){
          document.getElementById("pageName").style.display = 'none';
          document.getElementById("Modifications").style.display = 'none';
          document.getElementById("newpgName").style.display = 'block';
          document.getElementById("newpgName").disabled = false;
          document.getElementById("selectName").disabled = true;
          document.getElementById("Modifi").disabled = true;
        }else{
          document.getElementById("pageName").style.display = 'block';
          document.getElementById("Modifications").style.display = 'block';
          document.getElementById("newpgName").style.display = 'none';
          document.getElementById("newpgName").disabled = true;
          document.getElementById("selectName").disabled = false;
          document.getElementById("Modifi").disabled = false;
        }
      }
      function otherpgCheck(){
        if (document.getElementById('selectName').value == 'other'){
          document.getElementById('otherPage').style.display = 'block';
          document.getElementById('otherPage').disabled = false;
        }else{
          document.getElementById('otherPage').style.display = 'none';
          document.getElementById('otherPage').value = "";
          document.getElementById('otherPage').disabled = true;
        }
      }
      </script>

      <style>
        input,select,textarea{
          background: #f9f9f9 !important;
        }
        input:focus,select:focus,textarea:focus{
          background: #f7f1ef !important;
        }
        input[type=submit]{
          background:#0b5266 !important;
          color:#fff;
          width: 150px;
        }
        label{
          color:#0b5266;
        }
        h4{
          margin: 0 !important;
          background: #f7f1ef !important;
        }
        #pageType li{
          padding:5px;
          cursor: pointer;
        }
        #pageType li:hover{
          background: #f7f1ef;
          transition: all 0.3s;
        }
      </style>

      <div class="w3-container w3-padding" style="padding-bottom:40px !important;">
        <h1 class="w3-padding title">Page Change Request</h1>
        <div class='w3-padding w3-margin-top'>
          <a class='w3-small w3-btn w3-border w3-margin-left' href='requestsList.php'>Requests List</a>
        </div>
        <form action="addChangeRequest.php" method="post" enctype="multipart/form-data">
          <div class="w3-row">
            <div class="w3-padding w3-half">
              <input type="hidden" name="user" value="<?php echo $row['id']; ?>">
              <div class="w3-padding">
                <div class="w3-row">
                  <div class="w3-half">
                    <label><b>Page Type</b></label>
                    <select id= "pageType" class="w3-select w3-padding w3-white w3-border" name="pgtype" style="margin-top:5px;" onchange="setpageType()">
                      <option value="exisiting">Existing Page</option>
                      <option value="new">New Page</option>
                    </select>
                    <input id="newpgName" class="w3-input w3-border" type="text" style="margin-top:12px;margin-bottom:12px;display: none;" name="newpg" maxlength="100" placeholder="New Page Name" disabled required>
                  </div>
                  <div class="w3-half" style="padding-left:5px;">
                    <label><b>Priority Level</b></label>
                    <select class="w3-select w3-padding w3-white w3-border" name="requestprio" style="margin-top:5px;">
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low" selected>Low Priority</option>
                    </select>
                  </div>
                </div>

                <div class="w3-row w3-margin-top">
                  <div class="w3-half" id= "pageName">
                    <label><b>Page Name</b></label>
                    <select id= "selectName" class="w3-select w3-padding w3-white w3-border" name="slctname" style="margin-top:5px;" onchange="otherpgCheck()">
                      <option value="assets">Assets</option>
                      <option value="stock">Stock</option>
                      <option value="printers">Printers</option>
                      <option value="employees">Employees</option>
                      <option value="vendors">Vendors</option>
                      <option value="other">Other</option>
                    </select>
                    <input id="otherPage" class="w3-input w3-border" type="text" style="margin-top:12px;display:none;" name="otherpg" maxlength="100" placeholder="Other Page Name" disabled required>
                  </div>
                  <div class="w3-half" id= "Modifications" style="padding-left:5px;">
                    <label><b>Modification Type</b></label>
                    <select id= "Modifi" class="w3-select w3-padding w3-white w3-border" name="modifi" style="margin-top:5px;">
                      <option value="add">Add Elements</option>
                      <option value="delete">Delete Elements</option>
                      <option value="modify">Modify Elements</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="w3-padding" id="Description">
                <label><b>Description</b></label>
                <textarea id="Descrip" class="w3-input w3-border" type="text" style="width:100%;" name="descrip" required></textarea>
                <div class="w3-margin-top">
                  <label><b>Upload Image</b></label>
                  <input class="w3-input w3-border w3-padding" name="imagefile" type="file" accept="image/jpg,image/jpeg,image/png,image/bmp">
                </div>
              </div>
              <div id="submitDiv" class="w3-margin-top w3-padding">
                <input class="w3-btn" type="submit" style="background:#128cae;color:#fff;" value="Submit">
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
        <?php
    }
  }else{
    die("<meta http-equiv='refresh' content='0;rl=index.php' />");
  }
?>

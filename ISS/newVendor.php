<?php
  include "header.php";
  if(isset($_SESSION['ISStoken']) && !empty($_SESSION['ISStoken'])){
    $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
    if ($mysqli->connect_errno) {
      die("connectionFailed");
    }
    $token = $_SESSION['ISStoken'];
    $input1 = mysqli_real_escape_string($mysqli, $token);
    $sql0 = "SELECT * FROM `users` WHERE `token` = '".$input1."'";
    if(!$result0 = $mysqli->query($sql0)){
      $mysqli->close();
      die("queryFailed");
    }
    if ($result0->num_rows === 0){
      unset($_SESSION['ISStoken']);
      die("<meta http-equiv='refresh' content='0;url=index.php' />");
    }else{
      $row0 = $result0->fetch_array(MYSQLI_ASSOC);
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      ?>

      <script>
        function addMoreContact(){
          let contactType = [];
          let contactName = [];
          let contactPositon = [];
          let contactValue = [];
          for (let i=0;i<document.getElementsByName('contactType[]').length;i++){
            if(i != 0){
              contactType.push(document.getElementsByName('contactType[]')[i].value);
              contactName.push(document.getElementsByName('contactName[]')[i].value);
              contactPositon.push(document.getElementsByName('contactPositon[]')[i].value);
              contactValue.push(document.getElementsByName('contactValue[]')[i].value);
            }
          }
          document.getElementById("moreContactDiv").innerHTML=document.getElementById("moreContactDiv").innerHTML + `
          <div id="cn`+document.getElementsByName('contactType[]').length+`" class="w3-row w3-margin-top">
            <div class="w3-col m1">
              <select name="contactType[]" class="w3-select w3-padding w3-border" style="height:40px;">
                <option value="mobile">mobile</option>
                <option value="email">email</option>
                <option value="other">other</option>
              </select>
            </div>
            <div class="w3-col m2" style="padding-left:5px;">
              <input class="w3-input w3-border" type="text" name="contactPositon[]" maxlength="100" placeholder="position">
            </div>
            <div class="w3-col m2" style="padding-left:5px;">
              <input class="w3-input w3-border" type="text" name="contactName[]" maxlength="100" placeholder="name">
            </div>
            <div class="w3-col m2" style="padding-left:5px;">
              <input class="w3-input w3-border" type="text" name="contactValue[]" maxlength="100" placeholder="value">
            </div>
            <div class="w3-col m1 removebtns2" style="padding-left:5px;height:40px;">
              <a onclick='removeContact(`+document.getElementsByName('contactType[]').length+`)' class='w3-tag w3-red' style='cursor:pointer;height:22px;margin-top:9px;'>X</a>
            </div>
          </div>
          `;
          for (let i=0;i<document.getElementsByName('contactType[]').length - 1;i++){
            if(i != 0){
              document.getElementsByName('contactType[]')[i].value=contactType[i-1];
              document.getElementsByName('contactName[]')[i].value=contactName[i-1];
              document.getElementsByName('contactPositon[]')[i].value=contactPositon[i-1];
              document.getElementsByName('contactValue[]')[i].value=contactValue[i-1];
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
        .vendorResultElement{
          transition: all 0.5s;
        }
        .vendorResultElement:hover{
          background: #f1f1f1 !important;
        }
      </style>

      <div class="w3-container">
        <div class="w3-margin-top w3-padding">
          <h1 class="w3-padding title">Add New Vendor</h1>
          <form class="w3-padding" action="addNewVendor.php" method="post">
            <div class="w3-row">
              <div class="w3-col m7">
                <p>
                  <label>Name</label>
                  <input class="w3-input w3-border" type="text" name="name" maxlength="150" required>
                </p>
              </div>
              <div class="w3-col m7">
                <p>
                  <label>Notes</label>
                  <textarea class="w3-input w3-border" name="notes" rows="4" cols="80" style="resize:none;"></textarea>
                </p>
              </div>
            </div>
            <p>
              <label>Contact</label>
              <div class="w3-row">
                <div class="w3-col m1">
                  <select name="contactType[]" class="w3-select w3-padding w3-border" style="height:40px;">
                    <option value="mobile">mobile</option>
                    <option value="email">email</option>
                    <option value="other">other</option>
                  </select>
                </div>
                <div class="w3-col m2" style="padding-left:5px;">
                  <input class="w3-input w3-border" type="text" name="contactPositon[]" maxlength="100" placeholder="position">
                </div>
                <div class="w3-col m2" style="padding-left:5px;">
                  <input class="w3-input w3-border" type="text" name="contactName[]" maxlength="100" placeholder="name">
                </div>
                <div class="w3-col m2" style="padding-left:5px;">
                  <input class="w3-input w3-border" type="text" name="contactValue[]" maxlength="100" placeholder="value">
                </div>
              </div>
            </p>
            <div id="moreContactDiv"></div>
            <a class="w3-small" onclick="addMoreContact()" style="text-decoration:underline;color:#0b5266;cursor:pointer;">+ add more contact</a>
            <br>
            <br>
            <br>
            <input type="hidden" name="user" value="<?php echo $row0['id']; ?>">
            <input type="hidden" name="form" value="yes">
            <input class="w3-btn w3-margin-top" style="background:#128cae;color:#fff;" type="submit" value="Add Vendor">
          </form>
        </div>
      </div>
      <?php
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>

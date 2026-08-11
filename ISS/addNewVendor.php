<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["name"]) && !empty($_POST["name"])){
      date_default_timezone_set('Asia/Bahrain');
      $vendorName = htmlspecialchars($_POST['name'], ENT_QUOTES);
      $vendorNotes = htmlspecialchars($_POST['notes'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $vendorName);
      $input2 = mysqli_real_escape_string($mysqli, $vendorNotes);
      $input3 = mysqli_real_escape_string($mysqli, $user);
      $sql0 = "SELECT * FROM `vendors` WHERE `name`='".$input1."'";
      if(!$result0 = $mysqli->query($sql0)){
        die("queryFailed");
      }
      if ($result0->num_rows > 0){
        if(isset($_POST["form"])){
          include "header.php";
          echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
          echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed, Already Added</h2><center><h4>Redirecting ... </h4></center>";
          die('<meta http-equiv="refresh" content="2;url=newVendor.php" />');
        }else{
          die("alreadyAdded");
        }
      }
      $sql = "INSERT INTO `vendors`(`name`, `notes`, `user`, `inActive`) VALUES ('".$input1."','".$input2."',".$input3.",0)";
      if($mysqli->query($sql) === TRUE){
        $inID = $mysqli->insert_id;
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input3.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'add','vendor',".$mysqli->insert_id.")";
        $mysqli->query($sqlLog);
        if(isset($_POST["contactType"])){
          for ($i=0;$i<count($_POST["contactType"]);$i++){
            if(!empty($_POST['contactName'][$i]) && !empty($_POST['contactValue'][$i])){
              $contactName = htmlspecialchars($_POST['contactName'][$i], ENT_QUOTES);
              $contactType = htmlspecialchars($_POST['contactType'][$i], ENT_QUOTES);
              $contactValue = htmlspecialchars($_POST['contactValue'][$i], ENT_QUOTES);
              $contactPositon = htmlspecialchars($_POST['contactPositon'][$i], ENT_QUOTES);
              $input4 = mysqli_real_escape_string($mysqli, $contactName);
              $input5 = mysqli_real_escape_string($mysqli, $contactType);
              $input6 = mysqli_real_escape_string($mysqli, $contactValue);
              $input7 = mysqli_real_escape_string($mysqli, $contactPositon);
              $sql2 = "INSERT INTO `vendorsContacts`(`vendorID`, `contactType`, `contactName`, `contact`, `personPosition`) VALUES (".$inID.",'".$input5."','".$input4."','".$input6."','".$input7."')";
              if($mysqli->query($sql2) === FALSE){
                if(isset($_POST["form"])){
                  include "header.php";
                  echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
                  echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
                  die('<meta http-equiv="refresh" content="2;url=newVendor.php" />');
                }else{
                  die("failed");
                }
              }
            }
          }
        }
        if(isset($_POST["form"])){
          include "header.php";
          echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
          echo "<h2 style='text-align:center;' class='w3-margin-top w3-green'>Added Successfully</h2><center><h4>Redirecting ... </h4></center>";
          die('<meta http-equiv="refresh" content="2;url=vendors.php" />');
        }else{
          die("added");
        }
      }else{
        if(isset($_POST["form"])){
          include "header.php";
          echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
          echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
          die('<meta http-equiv="refresh" content="2;url=newVendor.php" />');
        }else{
          die("failed");
        }
      }
      $mysqli->close();
    }
  }
?>

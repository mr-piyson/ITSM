<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST'){
  if (isset($_POST["newStatus"]) && !empty($_POST["newStatus"]) && isset($_POST["requestID"]) && !empty($_POST["requestID"]) && isset($_POST["userID"]) && !empty($_POST["userID"])){
    date_default_timezone_set('Asia/Bahrain');
    $id = htmlspecialchars($_POST['requestID'], ENT_QUOTES);
    $status = htmlspecialchars($_POST['newStatus'], ENT_QUOTES);
    $userID = htmlspecialchars($_POST['userID'], ENT_QUOTES);
    $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
    if ($mysqli->correct_errno) {
      die("connectionFailed");
    }
    $input1 = mysqli_real_escape_string($mysqli, $id);
    $input2 = mysqli_real_escape_string($mysqli, $status);
    $input3 = mysqli_real_escape_string($mysqli, $userID);

    $sql3 = "UPDATE `requests` SET `status`='".$input2."' WHERE `id`=".$input1;

    if($mysqli->query($sql3) === TRUE){

      $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`)
                 VALUES (".$input3.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'), 'updateStatus', 'changerequest', ".$input1.")";
      $mysqli->query($sqlLog);

      include "header.php";
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      echo "<h2 style='text-align:center;' class='w3-margin-top w3-green'>Added Successfully</h2><center><h4>Redirecting ... </h4></center>";
      die('<meta http-equiv="refresh" content="2;url=requestsList.php" />');
    }else{
      include "header.php";
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2>";
    }
  }
}

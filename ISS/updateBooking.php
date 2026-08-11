<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["bookingID"]) && !empty($_POST["bookingID"]) && isset($_POST["user"]) && !empty($_POST["user"])){
      date_default_timezone_set('Asia/Bahrain');
      $bookingID = htmlspecialchars($_POST['bookingID'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $assetID = htmlspecialchars($_POST['assetID'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $bookingID);
      $input2 = mysqli_real_escape_string($mysqli, $user);
      $input3 = mysqli_real_escape_string($mysqli, $assetID);
      $sql = "UPDATE `assetBooking` SET `status`='recieved' WHERE `id`=".$input1;
      if($mysqli->query($sql) === TRUE){
        $sql2 = "UPDATE `assets` SET `deviceStatus` = 'Available' WHERE `id`=".$input3;
        $mysqli->query($sql2);
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input2.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'update','booking',".$input1.")";
        $mysqli->query($sqlLog);
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-green'>Updated Successfully</h2><center><h4>Redirecting ... </h4></center>";
        die('<meta http-equiv="refresh" content="2;url=bookingList.php" />');
      }else{
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
        die('<meta http-equiv="refresh" content="2;url=bookingList.php" />');
      }
      $mysqli->close();
    }
  }
?>

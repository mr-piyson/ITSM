<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    date_default_timezone_set('Asia/Bahrain');
    $tapeID = htmlspecialchars($_POST['TapeID'], ENT_QUOTES);
    $location = htmlspecialchars($_POST['Location'], ENT_QUOTES);
    $date = htmlspecialchars($_POST['Month'], ENT_QUOTES);
    $description = htmlspecialchars($_POST['Year'], ENT_QUOTES);
    $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
    $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
    if ($mysqli->connect_errno) {
      die("connectionFailed");
    }
    $input1 = mysqli_real_escape_string($mysqli, $tapeID);
    $input2 = mysqli_real_escape_string($mysqli, $location);
    $input3 = mysqli_real_escape_string($mysqli, $date);
    $input4 = mysqli_real_escape_string($mysqli, $description);
    $input5 = mysqli_real_escape_string($mysqli, $user);
    $sql = "INSERT INTO `tapes`(`tapeID`, `location`, `month`, `year`, `inActive`) VALUES ('".$input1."','".$input2."','".$input3."','".$input4."',0)";
    if($mysqli->query($sql) === TRUE){
      $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input5.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'add','tapes',". $mysqli->insert_id .")";
      $mysqli->query($sqlLog);
      include "header.php";
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      echo "<h2 style='text-align:center;' class='w3-margin-top w3-green'>Added Successfully</h2><center><h4>Redirecting ... </h4></center>";
      $mysqli->close();
      die('<meta http-equiv="refresh" content="2;url=tapes.php" />');
    }else{
      include "header.php";
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
      $mysqli->close();
      die('<meta http-equiv="refresh" content="2;url=tapes.php" />');
    }
  }
?>

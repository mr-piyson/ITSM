<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["printerID"]) && !empty($_POST["printerID"]) && isset($_POST["user"]) && !empty($_POST["user"])){
      date_default_timezone_set('Asia/Bahrain');
      $printerID = htmlspecialchars($_POST['printerID'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $printerID);
      $input2 = mysqli_real_escape_string($mysqli, $user);
      $sql = "UPDATE `printers` SET `inActive`=1 WHERE `id`=".$input1;
      if($mysqli->query($sql) === TRUE){
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input2.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'delete','printer',".$input1.")";
        $mysqli->query($sqlLog);
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-green'>Deleted Successfully</h2><center><h4>Redirecting ... </h4></center>";
        die('<meta http-equiv="refresh" content="2;url=printers.php" />');
      }else{
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
        die('<meta http-equiv="refresh" content="2;url=printers.php" />');
      }
      $mysqli->close();
    }
  }
?>

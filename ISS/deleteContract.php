<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["contractID"]) && !empty($_POST["contractID"]) && isset($_POST["user"]) && !empty($_POST["user"])){
      date_default_timezone_set('Asia/Bahrain');
      $contractID = htmlspecialchars($_POST['contractID'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $contractID);
      $input2 = mysqli_real_escape_string($mysqli, $user);
      $sql = "UPDATE `contracts` SET `inActive`=1 WHERE `id`=".$input1;
      if($mysqli->query($sql) === TRUE){
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input2.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'delete','contract',".$input1.")";
        $mysqli->query($sqlLog);
        die("deleted");
      }else{
        die("failed");
      }
      $mysqli->close();
    }
  }
?>

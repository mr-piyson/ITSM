<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["tapeID"]) && !empty($_POST["tapeID"])){
      date_default_timezone_set('Asia/Bahrain');
      $tapeID = htmlspecialchars($_POST['tapeID'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $id = htmlspecialchars($_POST['id'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $tapeID);
      $input2 = mysqli_real_escape_string($mysqli, $user);
      $input3 = mysqli_real_escape_string($mysqli, $id);
      $sql = "UPDATE `tapes` SET `month`= NULL, `year`= NULL, `status`= NULL, `sequenceNum`= NULL, `lastWritten`= NULL, `expire`= NULL, `free`= NULL, `location`= NULL
              WHERE `tapeID`='".$input1."'";
      if($mysqli->query($sql) === TRUE){
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input2.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'format','tapes',".$input3.")";
        $mysqli->query($sqlLog);
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-green'>Formatted Successfully</h2><center><h4>Redirecting ... </h4></center>";
        die('<meta http-equiv="refresh" content="2;url=tapes.php" />');
      }else{
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
        die('<meta http-equiv="refresh" content="2;url=tapes.php" />');
      }
      $mysqli->close();
    }
  }
?>

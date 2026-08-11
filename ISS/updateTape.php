<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(
      isset($_POST["UpdateTapeID"]) && !empty($_POST["UpdateTapeID"]) &&
      isset($_POST["Location"]) && !empty($_POST["Location"]) &&
      isset($_POST["Month"]) && !empty($_POST["Month"]) &&
      isset($_POST["Year"]) && !empty($_POST["Year"]) &&
      isset($_POST["Status"]) && !empty($_POST["Status"]) &&
      isset($_POST["SequenceNum"]) && !empty($_POST["SequenceNum"]) &&
      isset($_POST["LastWritten"]) && !empty($_POST["LastWritten"]) &&
      isset($_POST["Expire"]) && !empty($_POST["Expire"]) &&
      isset($_POST["Capacity"]) && !empty($_POST["Capacity"]) &&
      isset($_POST["Free"]) && !empty($_POST["Free"]) &&
      isset($_POST["user"]) && !empty($_POST["user"]) &&
      isset($_POST["id"]) && !empty($_POST["id"])
    ){
      date_default_timezone_set('Asia/Bahrain');
      $tapeID =  htmlspecialchars($_POST['UpdateTapeID'], ENT_QUOTES);
      $location = htmlspecialchars($_POST['Location'], ENT_QUOTES);
      $month = htmlspecialchars($_POST['Month'], ENT_QUOTES);
      $year = htmlspecialchars($_POST['Year'], ENT_QUOTES);
      $status = htmlspecialchars($_POST['Status'], ENT_QUOTES);
      $sequenceNum = htmlspecialchars($_POST['SequenceNum'], ENT_QUOTES);
      $lastWritten = htmlspecialchars($_POST['LastWritten'], ENT_QUOTES);
      $expire = htmlspecialchars($_POST['Expire'], ENT_QUOTES);
      $capacity = htmlspecialchars($_POST['Capacity'], ENT_QUOTES);
      $free = htmlspecialchars($_POST['Free'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $id = htmlspecialchars($_POST['id'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die ("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $tapeID);
      $input2 = mysqli_real_escape_string($mysqli, $location);
      $input3 = mysqli_real_escape_string($mysqli, $month);
      $input4 = mysqli_real_escape_string($mysqli, $year);
      $input5 = mysqli_real_escape_string($mysqli, $status);
      $input6 = mysqli_real_escape_string($mysqli, $sequenceNum);
      $input7 = mysqli_real_escape_string($mysqli, $lastWritten);
      $input8 = mysqli_real_escape_string($mysqli, $expire);
      $input9 = mysqli_real_escape_string($mysqli, $capacity);
      $input10 = mysqli_real_escape_string($mysqli, $free);
      $input11 = mysqli_real_escape_string($mysqli, $user);
      $input12 = mysqli_real_escape_string($mysqli, $id);
      $sql = "UPDATE `tapes` SET `location`='".$input2."',`month`='".$input3."',`year`='".$input4."',`status`='".$input5."',
              `sequenceNum`='".$input6."',`lastWritten`='".$input7."',`expire`='".$input8."',`capacity`='".$input9."',`free`='".$input10."' WHERE `tapeID`='".$input1."'";
        if($mysqli->query($sql) === TRUE){
          $sqlLog = "INSERT INTO `changes_logs` (`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input11.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'update','tapes',".$input12.")";
          $mysqli->query($sqlLog);
          $mysqli->close();
          include "header.php";
          echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
          echo "<h2 style='text-align:center;' class='w3-margin-top w3-green'>Updated Successfully</h2><center><h4>Redirecting ... </h4></center>";
          die('<meta http-equiv="refresh" content="2;url=tapeDetails.php?tape='.$tapeID.'" />');
        }else{
          $mysqli->close();
          include "header.php";
          echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
          echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
          die('<meta http-equiv="refresh" content="2;url=tapeDetails.php?tape='.$tapeID.'" />');
        }
    }else{
      die("Wrong !");
    }
  }
?>

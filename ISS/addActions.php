<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST["serverID"]) && !empty($_POST["serverID"])){
  date_default_timezone_set('Asia/Bahrain');
  $actionType = htmlspecialchars($_POST['actionType'], ENT_QUOTES);
  $actionDate = htmlspecialchars($_POST['actionDate'], ENT_QUOTES);
  $actionPeriod = htmlspecialchars($_POST['actionPeriod'], ENT_QUOTES);
  $actionDesc = htmlspecialchars($_POST['actionDescription'], ENT_QUOTES);
  $userAction = htmlspecialchars($_POST['userAction'], ENT_QUOTES);
  $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
  $serverID = htmlspecialchars($_POST['serverID'], ENT_QUOTES);
  $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
  if ($mysqli->connect_errno) {
    die("connectionFailed");
  }
  $input1 = mysqli_real_escape_string($mysqli, $actionType);
  $input2 = mysqli_real_escape_string($mysqli, str_replace("T"," ",$actionDate));
  $input3 = mysqli_real_escape_string($mysqli, $actionDesc);
  $input4 = mysqli_real_escape_string($mysqli, $user);
  $input5 = mysqli_real_escape_string($mysqli, $serverID);
  $input6 = mysqli_real_escape_string($mysqli, $userAction);
  $input7 = mysqli_real_escape_string($mysqli, $actionPeriod);
  $sql = "INSERT INTO `serverActions` (`serverID`, `actionType`, `actionDate`, `actionDescription`, `user`,  `actionPeriod`)
          VALUES (".$input5.", '".$input1."', STR_TO_DATE('".$input2."', '%Y-%m-%d %H:%i'), '".$input3."','".$input6."', '".$input7."')";
          if($mysqli->query($sql) === TRUE){
            $actionID = $mysqli->insert_id;
            if(count($_FILES) > 0 && !empty($_FILES['actionImage']['name'])){
              if($_FILES['actionImage']['error'] !==0){
                die("failedUpload1");
              }
              $info = getimagesize($_FILES['actionImage']['tmp_name']);
              if ($info === FALSE){
                die("failedUpload2");
              }
              if (($info[2] !== IMAGETYPE_GIF) && ($info[2] !== IMAGETYPE_JPEG) && ($info[2] !== IMAGETYPE_PNG) && ($info[2] !== IMAGETYPE_BMP)) {
                die("failedUpload3");
              }
              if (!move_uploaded_file($_FILES["actionImage"]["tmp_name"], "/var/www/html/ISS/itemsImages/serverAction".$actionID."_".$_FILES["actionImage"]["name"])){
                die("failedUpload4");
            }else{
              $imagePath = "/var/www/html/ISS/itemsImages/serverAction".$actionID."_".$_FILES["actionImage"]["name"];
              if($info[0] > 1000){
                $imageLayer = imagecreatetruecolor(1000, (1000*$info[1])/$info[0]);
                imagecopyresampled($imageLayer, imagecreatefromjpeg($imagePath), 0, 0, 0, 0, 1000, (1000*$info[1])/$info[0], $info[0], $info[1]);
                imagejpeg($imageLayer, $imagePath);
              }elseif($info[1] > 1000){
                $imageLayer = imagecreatetruecolor((1000*$info[0])/$info[1], 1000);
                imagecopyresampled($imageLayer, imagecreatefromjpeg($imagePath), 0, 0, 0, 0, (1000*$info[0])/$info[1],1000 , $info[0], $info[1]);
                imagejpeg($imageLayer, $imagePath);
              }
              $sql3 = "UPDATE `serverActions` SET `actionImage`='serverAction".$actionID."_".$_FILES["actionImage"]["name"]."' WHERE `id`=".$actionID;
              if($mysqli->query($sql3) === FALSE){
                include "header.php";
                echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
                echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
                die('<meta http-equiv="refresh" content="2;url=serverDetails.php?server='.$serverID.'" />');
              }
            }
          }
          $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input4.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'add','serverActions',".$actionID.")";
          $mysqli->query($sqlLog);
          include "header.php";
          echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
          echo "<h2 style='text-align:center;' class='w3-margin-top w3-green'>Added Successfully</h2><center><h4>Redirecting ... </h4></center>";
          $mysqli->close();
          die('<meta http-equiv="refresh" content="2;url=serverDetails.php?server='.$serverID.'" />');
        }else{
          include "header.php";
          echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
          echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
          $mysqli->close();
          die('<meta http-equiv="refresh" content="2;url=serverDetails.php?server='.$serverID.'" />');
        }
    }
?>

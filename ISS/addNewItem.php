<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["name"]) && !empty($_POST["name"])){
      date_default_timezone_set('Asia/Bahrain');
      $itemName = htmlspecialchars($_POST['name'], ENT_QUOTES);
      $itemBrand = htmlspecialchars($_POST['brand'], ENT_QUOTES);
      $itemStock = htmlspecialchars($_POST['stock'], ENT_QUOTES);
      $category = htmlspecialchars($_POST['category'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $itemName);
      $input2 = mysqli_real_escape_string($mysqli, $itemBrand);
      $input3 = mysqli_real_escape_string($mysqli, $itemStock);
      $input4 = mysqli_real_escape_string($mysqli, $user);
      $input5 = mysqli_real_escape_string($mysqli, $category);
      $sql0 = "SELECT * FROM `items` WHERE `name`='".$input1."'";
      if(!$result0 = $mysqli->query($sql0)){
        die("queryFailed");
      }
      if ($result0->num_rows > 0){
        if(isset($_POST["fromPage"])){
          include "header.php";
          echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
          echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed, Item Already Added</h2><center><h4>Redirecting ... </h4></center>";
          die('<meta http-equiv="refresh" content="2;url=home.php" />');
        }else{
          die("alreadyAdded");
        }
      }
      $sql = "INSERT INTO `items`(`name`, `stock`, `brand`, `user`, `img`, `inActive`, `category`) VALUES ('".$input1."','".$input3."','".$input2."',".$input4.",'',0,'".$input5."')";
      if($mysqli->query($sql) === TRUE){
        $itemID = $mysqli->insert_id;
        if(count($_FILES) > 0 && $_FILES['file']['error'] === 0){
          if ($_FILES['file']['error'] !== 0){
            die("failedUpload1");
          }
          $info = getimagesize($_FILES['file']['tmp_name']);
          if ($info === FALSE){
            die("failedUpload2");
          }
          if (($info[2] !== IMAGETYPE_GIF) && ($info[2] !== IMAGETYPE_JPEG) && ($info[2] !== IMAGETYPE_PNG) && ($info[2] !== IMAGETYPE_BMP)) {
            die("failedUpload3");
          }
          if (!move_uploaded_file($_FILES["file"]["tmp_name"], "/var/www/html/ISS/itemsImages/item".$itemID."_".$_FILES["file"]["name"])){
            die("failedUpload4");
          }else{
            $imagePath = "/var/www/html/ISS/itemsImages/item".$itemID."_".$_FILES["file"]["name"];
            if($info[0] > 1000){
              $imageLayer = imagecreatetruecolor(1000, (1000*$info[1])/$info[0]);
              imagecopyresampled($imageLayer, imagecreatefromjpeg($imagePath), 0, 0, 0, 0, 1000, (1000*$info[1])/$info[0], $info[0], $info[1]);
              imagejpeg($imageLayer, $imagePath);
            }elseif($info[1] > 1000){
              $imageLayer = imagecreatetruecolor((1000*$info[0])/$info[1], 1000);
              imagecopyresampled($imageLayer, imagecreatefromjpeg($imagePath), 0, 0, 0, 0, (1000*$info[0])/$info[1],1000 , $info[0], $info[1]);
              imagejpeg($imageLayer, $imagePath);
            }
            $sql3 = "UPDATE `items` SET `img`='item".$itemID."_".$_FILES["file"]["name"]."' WHERE `id`=".$itemID;
            if($mysqli->query($sql3) === FALSE){
              if(isset($_POST["fromPage"])){
                include "header.php";
                echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
                echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
                die('<meta http-equiv="refresh" content="2;url=home.php" />');
              }else{
                die("failed");
              }
            }
          }
        }
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input4.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'add','item',".$itemID.")";
        $mysqli->query($sqlLog);
        if(isset($_POST["fromPage"])){
          include "header.php";
          echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
          echo "<h2 style='text-align:center;' class='w3-margin-top w3-green'>Added Successfully</h2><center><h4>Redirecting ... </h4></center>";
          die('<meta http-equiv="refresh" content="2;url=home.php" />');
        }else{
          die("added");
        }
      }else{
        if(isset($_POST["fromPage"])){
          include "header.php";
          echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
          echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
          die('<meta http-equiv="refresh" content="2;url=home.php" />');
        }else{
          die("failed");
        }
      }
      $mysqli->close();
    }
  }
?>

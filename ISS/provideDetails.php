<?php
  include "header.php";
  if(isset($_SESSION['ISStoken']) && !empty($_SESSION['ISStoken'])){
    $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
    if ($mysqli->connect_errno) {
      die("connectionFailed");
    }
    $token = $_SESSION['ISStoken'];
    $input1 = mysqli_real_escape_string($mysqli, $token);
    $sql = "SELECT * FROM `users` WHERE `token` = '".$input1."'";
    if(!$result = $mysqli->query($sql)){
      $mysqli->close();
      die("queryFailed");
    }
    if ($result->num_rows === 0){
      unset($_SESSION['ISStoken']);
      die("<meta http-equiv='refresh' content='0;url=index.php' />");
    }else{
      if(isset($_GET["id"]) && !empty($_GET["id"]) && is_numeric($_GET["id"])){
        $itemID = htmlspecialchars($_GET['id'], ENT_QUOTES);
        $input2 = mysqli_real_escape_string($mysqli, $itemID);
        $sql2 = "SELECT * FROM `provide` WHERE `id`=".$input2;
        if(!$result2 = $mysqli->query($sql2)){
          $mysqli->close();
          die("queryFailed");
        }
        if ($result2->num_rows === 0){
          die("<meta http-equiv='refresh' content='0;url=index.php' />");
        }else{
          $items = array();
          $row2 = $result2->fetch_array(MYSQLI_ASSOC);
          $sql3 = "SELECT * FROM `employees` WHERE `empID`=".$row2["empID"];
          $sql4 = "SELECT * FROM `employees` WHERE `empID`=".$row2["requestBy"];
          $sql5 = "SELECT * FROM `employees` WHERE `empID`=".$row2["recievedBy"];
          if(!$result3 = $mysqli->query($sql3)){
            $mysqli->close();
            die("queryFailed");
          }
          if(!$result4 = $mysqli->query($sql4)){
            $mysqli->close();
            die("queryFailed");
          }
          if(!$result5 = $mysqli->query($sql5)){
            $mysqli->close();
            die("queryFailed");
          }
          $sql6 = " SELECT provideItems.quantity,items.name as itemName,items.brand as itemBrand
                    FROM provideItems
                    INNER JOIN items
                    ON provideItems.itemID = items.id
                    WHERE provideItems.provideID =".$row2["id"];
          if(!$result6 = $mysqli->query($sql6)){
            $mysqli->close();
            die("queryFailed");
          }
          $row3 = $result3->fetch_array(MYSQLI_ASSOC);
          $row4 = $result4->fetch_array(MYSQLI_ASSOC);
          $row5 = $result5->fetch_array(MYSQLI_ASSOC);
          while($row6 = $result6->fetch_assoc()){
            $items[]=$row6;
          }
        }
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        ?>
        <div class="w3-container w3-padding" style="padding-bottom:40px !important;">
          <div class="w3-padding">
            <?php if($_GET['i'] == "report"){ ?>
            <a class="w3-small w3-btn w3-border" href="report.php">BACK</a>
            <?php }else{ ?>
            <a class="w3-small w3-btn w3-border" href="itemDetails.php?id=<?php echo $_GET['i']; ?>">BACK</a>
            <?php } ?>
          </div>
          <div>
            <h1 class="w3-padding title">Provide Details</h1>
            <div class="w3-row">
              <div class="w3-third w3-padding">
                <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                  <i>General Information</i>
                </div>
                <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
                  <tr>
                    <td><b>Date</b></td>
                    <td><?php echo $row2["date"]; ?></td>
                  </tr>
                  <tr>
                    <td><b>Employee</b></td>
                    <td><?php echo $row3["name"]; ?></td>
                  </tr>
                  <tr>
                    <td><b>Requested By</b></td>
                    <td><?php echo $row4["name"]; ?></td>
                  </tr>
                  <tr>
                    <td><b>Received By</b></td>
                    <td><?php echo $row5["name"]; ?></td>
                  </tr>
                  <tr>
                    <td><b>Provided By</b></td>
                    <td><?php echo $row2["provideBy"]; ?></td>
                  </tr>
                  <tr>
                    <td><b>Notes</b></td>
                    <td><?php echo $row2["notes"]; ?></td>
                  </tr>
                </table>
              </div>
              <div class="w3-third w3-padding">
                <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                  <i>Items</i>
                </div>
                <?php
                  for ($x=0;$x<count($items);$x++){
                    ?>
                    <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
                      <tr>
                        <td><b>Name</b></td>
                        <td><?php echo $items[$x]["itemName"]; ?></td>
                      </tr>
                      <tr>
                        <td><b>Brand</b></td>
                        <td><?php echo $items[$x]["itemBrand"]; ?></td>
                      </tr>
                      <tr>
                        <td><b>Quantity</b></td>
                        <td><?php echo $items[$x]["quantity"]; ?></td>
                      </tr>
                    </table>
                    <?php
                  }
                ?>
              </div>
            </div>
          </div>
        </div>
        <?php
      }else{
        die("<meta http-equiv='refresh' content='0;url=index.php' />");
      }
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>

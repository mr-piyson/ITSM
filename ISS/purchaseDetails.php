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
        $purchaseID = htmlspecialchars($_GET['id'], ENT_QUOTES);
        $input2 = mysqli_real_escape_string($mysqli, $purchaseID);
        $sql2 = "SELECT * FROM `purchase` WHERE `id`=".$input2;
        if(!$result2 = $mysqli->query($sql2)){
          $mysqli->close();
          die("queryFailed");
        }
        if ($result2->num_rows === 0){
          die("<meta http-equiv='refresh' content='0;url=index.php' />");
        }else{
          $row2 = $result2->fetch_array(MYSQLI_ASSOC);
          $items = array();
          $services = array();
          $sql3 = "SELECT * FROM `vendors` WHERE `id`=".$row2["vendorID"];
          if($row2["ServiceType"] == 1){
            $sql4 = " SELECT `serviceName`, `servicePrice` FROM `purchaseServices` WHERE `purchaseID` = ".$row2["id"];
            if(!$result4 = $mysqli->query($sql4)){
              $mysqli->close();
              die("queryFailed");
            }
            while($row4 = $result4->fetch_assoc()){
              $services[]=$row4;
            }
          }else{
            $sql4 = " SELECT purchaseItems.quantity,purchaseItems.price,items.name as itemName,items.brand as itemBrand
                      FROM purchaseItems
                      INNER JOIN items
                      ON purchaseItems.itemID = items.id
                      WHERE purchaseItems.purchaseID =".$row2["id"];
            if(!$result4 = $mysqli->query($sql4)){
              $mysqli->close();
              die("queryFailed");
            }
            while($row4 = $result4->fetch_assoc()){
              $items[]=$row4;
            }
          }
          if(!$result3 = $mysqli->query($sql3)){
            $mysqli->close();
            die("queryFailed");
          }
          $row3 = $result3->fetch_array(MYSQLI_ASSOC);
        }
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        ?>
        <div class="w3-container w3-padding" style="padding-bottom:40px !important;">
          <div class="w3-padding">
            <?php if($_GET['i'] == "report"){ ?>
            <a class="w3-small w3-btn w3-border" href="stockReport.php">BACK</a>
            <?php }else{ ?>
            <a class="w3-small w3-btn w3-border" href="itemDetails.php?id=<?php echo $_GET['i']; ?>">BACK</a>
            <?php } ?>
          </div>
          <div>
            <a href="copyPurchase.php?id=<?php echo $row2['id']; ?>" class="w3-right w3-margin-left w3-margin-right w3-btn w3-border">Copy</a>
            <a onclick="document.getElementById('updateDiv').style.display='block'" class="w3-right w3-btn w3-border">Update</a>
            <h1 class="w3-padding title">Purchase Details</h1>
            <div class="w3-row">
              <div class="w3-third w3-padding">
                <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                  <i>General Information</i>
                </div>
                <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
                  <tr>
                    <td><b>Purchase/Service</b></td>
                    <?php if($row2["ServiceType"] == 0){ ?>
                      <td>Purchase</td>
                    <?php }else{ ?>
                      <td>Service</td>
                    <?php } ?>
                  </tr>
                  <tr>
                    <td><b>Quotation Date</b></td>
                    <td><?php echo $row2["quotationDate"]; ?></td>
                  </tr>
                  <tr>
                    <td><b>Vendor</b></td>
                    <td><?php echo $row3["name"]; ?></td>
                  </tr>
                  <tr>
                    <td><b>PO Number</b></td>
                    <td><?php echo $row2["poNumber"]; ?></td>
                  </tr>
                  <tr>
                    <td><b>MRN Number</b></td>
                    <td><?php echo $row2["mrnNumber"]; ?></td>
                  </tr>
                  <tr>
                    <td><b>Paid Date</b></td>
                    <td><?php echo $row2["paidDate"]; ?></td>
                  </tr>
                </table>
              </div>
              <div class="w3-third w3-padding">
                <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                  <i>Options</i>
                </div>
                <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
                  <tr>
                    <td><b>Buyer</b></td>
                    <td><?php echo $row2["buyer"]; ?></td>
                  </tr>
                  <tr>
                    <td><b>Advance Request</b></td>
                    <td><?php echo ($row2["advanceRequest"] == 1) ? "Yes" : "No"; ?></td>
                  </tr>
                  <tr>
                    <td><b>LPO</b></td>
                    <td><?php echo ($row2["LPO"] == 1) ? "Yes" : "No"; ?></td>
                  </tr>
                  <tr>
                    <td><b>Invoice</b></td>
                    <td><?php echo ($row2["invoice"] == 1) ? "Yes" : "No"; ?></td>
                  </tr>
                  <tr>
                    <td><b>Delivery Note</b></td>
                    <td><?php echo ($row2["deliveryNote"] == 1) ? "Yes" : "No"; ?></td>
                  </tr>
                  <tr>
                    <td><b>MRN</b></td>
                    <td><?php echo ($row2["mrn"] == 1) ? "Yes" : "No"; ?></td>
                  </tr>
                </table>
              </div>
              <div class="w3-third w3-padding">
                <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                  <i>Notes</i>
                </div>
                <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
                  <tr>
                    <td><b>For Who</b></td>
                    <td><?php echo $row2["forWho"]; ?></td>
                  </tr>
                  <tr>
                    <td><b>Notes</b></td>
                    <td><?php echo $row2["notes"]; ?></td>
                  </tr>
                  <tr>
                    <td><b>Link</b></td>
                    <td><a target="_blank" href="<?php echo $row2['link']; ?>"><?php echo $row2["link"]; ?></a></td>
                  </tr>
                </table>
              </div>
            </div>
            <div class="w3-row">
              <?php if($row2["ServiceType"] == 1){ ?>
                <div class="w3-third w3-padding">
                  <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                    <i>Services</i>
                  </div>
                  <?php
                    for ($x=0;$x<count($services);$x++){
                      ?>
                      <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
                        <tr>
                          <td style="width:50px;"><b>Name</b></td>
                          <td><?php echo $services[$x]["serviceName"]; ?></td>
                        </tr>
                        <tr>
                          <td style="width:50px;"><b>Price</b></td>
                          <td><?php echo $services[$x]["servicePrice"]; ?></td>
                        </tr>
                      </table>
                      <?php
                    }
                  ?>
                </div>
              <?php }else{ ?>
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
                        <tr>
                          <td><b>Price</b></td>
                          <td><?php echo $items[$x]["price"]; ?></td>
                        </tr>
                      </table>
                      <?php
                    }
                  ?>
                </div>
              <?php } ?>
              <div class="w3-third w3-padding">
                <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                  <i>Total</i>
                </div>
                <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
                  <tr>
                    <td><b>Currency</b></td>
                    <td><?php echo $row2["currency"]; ?></td>
                  </tr>
                  <tr>
                    <td><b>Current Total</b></td>
                    <td><?php echo $row2["currentTotal"]; ?></td>
                  </tr>
                  <tr>
                    <td><b>VAT</b></td>
                    <td><?php echo $row2["vat"]; ?></td>
                  </tr>
                  <tr>
                    <td><b>Grand Total</b></td>
                    <td><?php echo $row2["grandTotal"]; ?></td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div id="updateDiv" class="w3-modal">
          <div class="w3-modal-content w3-animate-top">
            <div class="w3-container" style="height:650px;overflow:auto;background:#f9f9f9;">
              <h2 class="title">Update Purchase</h2>
              <form action="updatePurchase.php" method="post">
                <label class="w3-text-grey">Quotation Date</label>
                <input class="w3-input w3-border" type="date" name="quotationDate" value="<?php echo $row2["quotationDate"]; ?>">
                <br>
                <label class="w3-text-grey">Paid Date</label>
                <input class="w3-input w3-border" type="date" name="paidDate" value="<?php echo $row2["paidDate"]; ?>">
                <br>
                <label class="w3-text-grey">PO Number</label>
                <input class="w3-input w3-border" type="number" name="poNumber" value="<?php echo $row2["poNumber"]; ?>">
                <br>
                <label class="w3-text-grey">MRN Number</label>
                <input class="w3-input w3-border" type="text" name="mrnNumber" value="<?php echo $row2["mrnNumber"]; ?>">
                <br>
                <label class="w3-text-grey">For Who</label>
                <input class="w3-input w3-border" type="text" name="forWho" value="<?php echo $row2["forWho"]; ?>">
                <br>
                <label class="w3-text-grey">Notes</label>
                <input class="w3-input w3-border" type="text" name="notes" value="<?php echo $row2["notes"]; ?>">
                <label class="w3-text-grey">Link</label>
                <input class="w3-input w3-border" type="text" name="link" value="<?php echo $row2["link"]; ?>">
                <input type="hidden" name="purchaseID" value="<?php echo $row2['id']; ?>">
            </div>
            <div class="w3-container w3-light-grey w3-padding">
              <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('updateDiv').style.display='none'">Close</div>
              <input class="w3-btn w3-right w3-white w3-border w3-small w3-margin-right" type="submit" value="Update">
            </div>
            </form>
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

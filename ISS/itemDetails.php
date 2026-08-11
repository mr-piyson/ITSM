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
        $row = $result->fetch_array(MYSQLI_ASSOC);
        $itemID = htmlspecialchars($_GET['id'], ENT_QUOTES);
        $input2 = mysqli_real_escape_string($mysqli, $itemID);
        $sql2 = "SELECT * FROM `items` WHERE `id`=".$input2;
        if(!$result2 = $mysqli->query($sql2)){
          $mysqli->close();
          die("queryFailed");
        }
        if ($result2->num_rows === 0){
          die("<meta http-equiv='refresh' content='0;url=index.php' />");
        }else{
          $purchased = array();
          $provided = array();
          $printersLinked = array();
          $row2 = $result2->fetch_array(MYSQLI_ASSOC);
          $sql3 = "SELECT p.* from provideItems p
                   LEFT JOIN provide pr
                   ON pr.id = p.provideID
                   WHERE p.itemID = ".$row2["id"]." 
                   order by pr.date DESC";
          $sql4 = "SELECT p.* FROM purchaseItems p
                   LEFT JOIN purchase pp
                   on pp.id = p.purchaseID
                   WHERE p.itemID = ".$row2["id"]."
                   ORDER by pp.quotationDate DESC";
          if(!$result3 = $mysqli->query($sql3)){
            $mysqli->close();
            die("queryFailed");
          }
          if(!$result4 = $mysqli->query($sql4)){
            $mysqli->close();
            die("queryFailed");
          }
          while($row3 = $result3->fetch_assoc()){
            $sql5 = " SELECT provide.date,provide.provideBy,provide.notes,provide.id,e1.name as employeeName,e2.name as requestedBy,e3.name as receivedBy
                      FROM provide
                      INNER JOIN employees as e1
                      ON provide.empID = e1.empID
                      INNER JOIN employees as e2
                      ON provide.requestBy = e2.empID
                      INNER JOIN employees as e3
                      ON provide.recievedBy = e3.empID
                      WHERE provide.id =".$row3["provideID"];
            if(!$result5 = $mysqli->query($sql5)){
              $mysqli->close();
              die("queryFailed");
            }
            $row5 = $result5->fetch_array(MYSQLI_ASSOC);
            $provided[] = array('details'=>$row5,"quantity"=>$row3["quantity"]);
          }
          while($row4 = $result4->fetch_assoc()){
            $sql6 = " SELECT purchase.poNumber,purchase.quotationDate,purchase.currency,purchase.forWho,purchase.id,vendors.name as vendorName
                      FROM purchase
                      INNER JOIN vendors
                      ON purchase.vendorID = vendors.id
                      WHERE purchase.id =".$row4["purchaseID"];
            if(!$result6 = $mysqli->query($sql6)){
              $mysqli->close();
              die("queryFailed");
            }
            $row6 = $result6->fetch_array(MYSQLI_ASSOC);
            $purchased[] = array('details'=>$row6,"quantity"=>$row4["quantity"],"price"=>$row4["price"]);
          }
        }
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        ?>

        <script>
          var linkedPrinters = [];
          var unlinkedPrinters = [];
          function showUpdateItemModal(){
            document.getElementById("updateHeaderDiv").style.display = "none";
            document.getElementById("updateHeaderDiv").innerHTML = "";
            document.getElementById("updateDiv").innerHTML = '<a onclick="updateItemSubmitted()" class="w3-margin-top w3-btn" style="background:#128cae;color:#fff;">UPDATE</a>';
            document.getElementById("updateItemGeneralInfoDiv").style.display = "block";
            document.getElementById("itemName").value = '<?php echo $row2["name"]; ?>';
            document.getElementById("itemBrand").value = '<?php echo $row2["brand"]; ?>';
            document.getElementById("itemStock").value = '<?php echo $row2["stock"]; ?>';
            if("<?php echo $row2["category"]; ?>" != ""){
              document.getElementById("itemCategory").value = '<?php echo $row2["category"]; ?>';
            }else{
              document.getElementById("itemCategory").selectedIndex = 0;
            }
            document.getElementById("updateItemGeneralInfo").style.display = "block";
          }

          function showDeleteItemModa(){
            document.getElementById("deleteItemGeneralInfo").style.display = "block";
          }

          function updateItemSubmitted(){
            if(document.getElementById('itemName').value.trim().length < 1){
              alert("Please fill item's name !");
            }else{
              if(document.getElementById("itemStock").value == ""){
                document.getElementById("itemStock").value = 0;
              }
              document.getElementById("updateDiv").innerHTML = "<h3 class='w3-margin-top w3-center'>Loading ...</h3>";

              var formData = new FormData();
              formData.append("name", document.getElementById("itemName").value.trim().replace(/"/g, 'inch'));
              formData.append("brand", document.getElementById("itemBrand").value.trim());
              formData.append("stock", document.getElementById("itemStock").value.trim());
              formData.append("category", document.getElementById("itemCategory").value);
              formData.append("user", "<?php echo $row['id']; ?>");
              formData.append("itemID", "<?php echo $row2['id']; ?>");
              if(document.getElementById('itemImage').files.length > 0){
                formData.append("file", document.getElementById('itemImage').files[0]);
              }

              var xhr = new XMLHttpRequest();
              xhr.open("POST", 'updateItem.php', true);
              xhr.onreadystatechange = function() {
                if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                  document.getElementById("updateHeaderDiv").style.display = "block";
                  document.getElementById("updateItemGeneralInfoDiv").style.display = "none";
                  if(xhr.responseText == "added"){
                    document.getElementById("updateHeaderDiv").innerHTML = "<h3 class='w3-margin-top w3-center w3-green'>Updated Successfully!</h3>";
                    setTimeout(function(){
                      location.reload();
                    }, 1000);
                  }else{
                    document.getElementById("updateHeaderDiv").innerHTML = "<h3 class='w3-margin-top w3-center w3-red'>Failed</h3>";
                  }
                }
              }
              xhr.send(formData);
            }
          }

          function linkPrinter(printerID){
            if(linkedPrinters.includes(printerID)){
              let newLinkedPrinters = [];
              for (let i=0;i<linkedPrinters.length;i++){
                if(linkedPrinters[i] != printerID){
                  newLinkedPrinters.push(linkedPrinters[i]);
                }
              }
              linkedPrinters = [];
              for (let x=0;x<newLinkedPrinters.length;x++){
                linkedPrinters.push(newLinkedPrinters[x]);
              }
              document.getElementById("pri"+printerID).classList.remove("w3-pale-yellow");
              document.getElementById("corr"+printerID).style.display = "none";
            }else{
              linkedPrinters.push(printerID);
              document.getElementById("pri"+printerID).classList.add("w3-pale-yellow");
              document.getElementById("corr"+printerID).style.display = "block";
            }
          }

          function LinkPrintersSubmitted(){
            if(linkedPrinters.length > 0){
              document.getElementById("linkPrinterDiv").style.display = "none";
              document.getElementById("linkPrinterLoading").style.display = "block";
              let printersString = "";
              for (let n=0;n<linkedPrinters.length;n++){
                printersString = printersString + linkedPrinters[n] + ",";
              }
              var xhr = new XMLHttpRequest();
              xhr.open("POST", 'linkPrinters.php', true);
              xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
              xhr.onreadystatechange = function() {
                if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200){
                  if(xhr.responseText == "added"){
                    document.getElementById("linkPrinterLoading").innerHTML = "<h3 class='w3-margin-top w3-center w3-green'>Linked Successfully!</h3>";
                    setTimeout(function(){
                      window.location.reload();
                    }, 500);
                  }else{
                    document.getElementById("linkPrinterLoading").innerHTML = "<h3 class='w3-margin-top w3-center w3-red'>Failed</h3>";
                  }
                }
              }
              xhr.send("itemID=<?php echo $row2['id']; ?>&printers="+printersString+"&user=<?php echo $row['id']; ?>");
            }else{
              alert("Select Printer(s) Please !");
            }
          }

          function showLinkedPrinterPopup(){
            document.getElementById('addPrinterModal').style.display='block';
          }

          function unLinkPrintersSubmitted(){
            if(unlinkedPrinters.length > 0){
              document.getElementById("linkPrinterDiv").style.display = "none";
              document.getElementById("linkPrinterLoading").innerHTML = "";
              document.getElementById("linkPrinterLoading").style.display = "block";
              let printersString = "";
              for (let n=0;n<unlinkedPrinters.length;n++){
                printersString = printersString + unlinkedPrinters[n] + ",";
              }
              var xhr = new XMLHttpRequest();
              xhr.open("POST", 'unlinkPrinters.php', true);
              xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
              xhr.onreadystatechange = function() {
                if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200){
                  if(xhr.responseText == "added"){
                    document.getElementById("linkPrinterLoading").innerHTML = "<h3 class='w3-margin-top w3-center w3-green'>Unlinked Successfully!</h3>";
                    setTimeout(function(){
                      window.location.reload();
                    }, 500);
                  }else{
                    document.getElementById("linkPrinterLoading").innerHTML = "<h3 class='w3-margin-top w3-center w3-red'>Failed</h3>";
                  }
                }
              }
              xhr.send("itemID=<?php echo $row2['id']; ?>&printers="+printersString+"&user=<?php echo $row['id']; ?>");
            }else{
              alert("there is no linked printer(s) !");
            }
          }

          function myFunction(){
            for (var i = 0; i < document.getElementsByClassName("hiddenTables").length; i++) {
              if(document.getElementsByClassName("hiddenTables")[i].style.display == "none"){
                document.getElementsByClassName("hiddenTables")[i].style.display = "table";
              }else{
                document.getElementsByClassName("hiddenTables")[i].style.display = "none";
              }
            }
          }
        </script>

        <style>
          .labelTD{
            width:180px !important;
          }
        </style>

        <div class="w3-container w3-padding" style="padding-bottom:40px !important;">
          <div class="w3-padding">
            <a class="w3-small w3-btn w3-border" href="stock.php">BACK</a>
          </div>
          <div>
            <h1 class="w3-padding title">Item Details</h1>
            <div class="w3-row">
              <div class="w3-third w3-padding">
                <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                  <i>General Information</i>
                </div>
                <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
                  <tr>
                    <td class='labelTD'><b>Name</b></td>
                    <td><?php echo $row2["name"]; ?></td>
                  </tr>
                  <tr>
                    <td class='labelTD'><b>Brand</b></td>
                    <td><?php echo $row2["brand"]; ?></td>
                  </tr>
                  <tr>
                    <td class='labelTD'><b>Stock</b></td>
                    <td><?php echo $row2["stock"]; ?></td>
                  </tr>
                  <tr>
                    <td class='labelTD'><b>Category</b></td>
                    <td><?php echo $row2["category"]; ?></td>
                  </tr>
                  <?php if($row2["category"] == "Toners/Rolls"){ ?>
                  <tr>
                    <td class='labelTD'><b>Printers</b></td>
                    <td>
                    <?php
                      $sql9 = "SELECT * FROM `printersToners` WHERE `tonerID`=".$row2["id"];
                      if(!$result9 = $mysqli->query($sql9)){
                        $mysqli->close();
                        die("queryFailed");
                      }
                      while($row9 = $result9->fetch_assoc()){
                        $sql10 = "SELECT * FROM `printers` WHERE `id`=".$row9["PrinterID"];
                        if(!$result10 = $mysqli->query($sql10)){
                          $mysqli->close();
                          die("queryFailed");
                        }
                        if ($result10->num_rows > 0){
                          $row10 = $result10->fetch_array(MYSQLI_ASSOC);
                          echo $row10["name"]." <span class='w3-small w3-text-grey'>(".$row10["location"].")</span><br>";
                          $printersLinked[]=$row10["id"];
                        }
                      }
                    ?>
                    <a onclick="showLinkedPrinterPopup();" class='w3-btn w3-small w3-margin-top w3-border'>Link Printer</a>
                    </td>
                  </tr>
                  <?php } ?>
                  <?php if(!empty($row2["img"])){ ?>
                  <tr>
                    <td colspan="2"><img style="width:100%;width:350px;" src="http://iss.bfginternational.com/ISS/itemsImages/<?php echo $row2['img']; ?>" /></td>
                  </tr>
                  <?php }else{ ?>
                    <tr>
                      <td colspan="2">no image</td>
                    </tr>
                  <?php } ?>
                </table>
                <a class="w3-btn w3-border w3-small w3-margin-top" onclick="showUpdateItemModal()">Update</a>
                <a class="w3-btn w3-border w3-small w3-margin-top" onclick="showDeleteItemModa()">Delete</a>
              </div>
              <div class="w3-third w3-padding">
                <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                  <i>Purchased (<?php echo $result4->num_rows; ?>)</i>
                </div>
                <?php
                  for ($m=0;$m<count($purchased);$m++){
                    ?>
                    <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
                      <tr>
                        <td class='labelTD'><b>Vendor</b></td>
                        <td><?php echo $purchased[$m]["details"]["vendorName"]; ?></td>
                      </tr>
                      <tr>
                        <td class='labelTD'><b>PO Number</b></td>
                        <td><?php echo $purchased[$m]["details"]["poNumber"]; ?></td>
                      </tr>
                      <tr>
                        <td class='labelTD'><b>Quantity</b></td>
                        <td><?php echo $purchased[$m]["quantity"]; ?></td>
                      </tr>
                      <tr>
                        <td class='labelTD'><b>Currency</b></td>
                        <td><?php echo $purchased[$m]["details"]["currency"]; ?></td>
                      </tr>
                      <tr>
                        <td class='labelTD'><b>Price</b></td>
                        <td><?php echo $purchased[$m]["price"]; ?></td>
                      </tr>
                      <tr>
                        <td class='labelTD'><b>For Who</b></td>
                        <td><?php echo $purchased[$m]["details"]["forWho"]; ?></td>
                      </tr>
                      <tr>
                        <td class='labelTD'><b>Quotation Date</b></td>
                        <td><?php echo $purchased[$m]["details"]["quotationDate"]; ?></td>
                      </tr>
                      <tr>
                        <td colspan="2"><a href='purchaseDetails.php?id=<?php echo $purchased[$m]["details"]["id"]; ?>&i=<?php echo $row2["id"]; ?>' class="w3-btn w3-small" style="background:#128cae;color:#fff;">More details</a></td>
                      </tr>
                    </table>
                    <?php
                  }
                ?>
              </div>
              <div class="w3-third w3-padding">
                <button class="w3-button w3-small w3-round-xxlarge w3-right w3-padding" onclick="myFunction()" style="padding-bottom: 8px;padding-top: 8px;margin-right: 3px;margin-top: 3.5px;">Full List</button>
                <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                  <i>Provided (<?php echo $result3->num_rows; ?>)</i>
                </div>
                <?php
                  for ($b=0;$b<count($provided);$b++){
                    $tableClassName = "normalTables";
                    $tableDisplayStyle = "table";
                    if($b > 9){
                      $tableDisplayStyle = "none";
                      $tableClassName = "hiddenTables";
                    }
                    ?>
                    <table class="w3-table w3-table-all w3-card-2 w3-margin-top <?php echo $tableClassName; ?>" style="display:<?php echo $tableDisplayStyle; ?>;">
                      <tr>
                        <td class='labelTD'><b>Date</b></td>
                        <td><?php echo $provided[$b]["details"]["date"]; ?></td>
                      </tr>
                      <tr>
                        <td class='labelTD'><b>Quantity</b></td>
                        <td><?php echo $provided[$b]["quantity"]; ?></td>
                      </tr>
                      <tr>
                        <td class='labelTD'><b>Employee</b></td>
                        <td><?php echo $provided[$b]["details"]["employeeName"]; ?></td>
                      </tr>
                      <tr>
                        <td class='labelTD'><b>Request By</b></td>
                        <td><?php echo $provided[$b]["details"]["requestedBy"]; ?></td>
                      </tr>
                      <tr>
                        <td class='labelTD'><b>Recieved By</b></td>
                        <td><?php echo $provided[$b]["details"]["receivedBy"]; ?></td>
                      </tr>
                      <tr>
                        <td class='labelTD'><b>Provide By</b></td>
                        <td><?php echo $provided[$b]["details"]["provideBy"]; ?></td>
                      </tr>
                      <tr>
                        <td class='labelTD'><b>Notes</b></td>
                        <td><?php echo $provided[$b]["details"]["notes"]; ?></td>
                      </tr>
                      <tr>
                        <td colspan="2"><a href='provideDetails.php?id=<?php echo $provided[$b]["details"]["id"]; ?>&i=<?php echo $row2["id"]; ?>' class="w3-btn w3-small" style="background:#128cae;color:#fff;">More details</a></td>
                      </tr>
                    </table>
                    <?php
                  }
                ?>
              </div>
            </div>
          </div>
        </div>


        <div id="updateItemGeneralInfo" class="w3-modal">
          <div class="w3-modal-content w3-animate-top">
            <div class="w3-container" style="height:550px;overflow:auto;background:#f9f9f9;">
              <div id="updateHeaderDiv" style="display:none" class="w3-container w3-margin"></div>
              <div id="updateItemGeneralInfoDiv" class="w3-container w3-margin">
                <h2 class="title">Update Item Details</h2>
                <p>
                  <label>Name</label>
                  <input id="itemName" class="w3-input w3-border" type="text" maxlength="100">
                </p>
                <p>
                  <label>Brand</label>
                  <input id="itemBrand" class="w3-input w3-border" type="text" maxlength="100">
                </p>
                <p>
                  <label>Stock</label>
                  <input id="itemStock" class="w3-input w3-border" type="number">
                </p>
                <p>
                  <label>Category</label>
                  <select class="w3-select w3-border w3-padding w3-white" id="itemCategory">
                    <option value="IT Stationery and Accessories">IT Stationery and Accessories</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Toners/Rolls">Toners/Rolls</option>
                  </select>
                </p>
                <p>
                  <label>Image</label>
                  <input id="itemImage" class="w3-input w3-border" type="file" accept="image/*">
                </p>
                <div id="updateDiv">
                  <a onclick="updateItemSubmitted()" class="w3-margin-top w3-btn" style="background:#128cae;color:#fff;">UPDATE</a>
                </div>
              </div>
            </div>
            <div class="w3-container w3-light-grey w3-padding">
              <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('updateItemGeneralInfo').style.display='none'">Close</div>
            </div>
          </div>
        </div>

        <div id="deleteItemGeneralInfo" class="w3-modal">
          <div class="w3-modal-content w3-animate-top">
            <div class="w3-container" style="height:550px;overflow:auto;background:#f9f9f9;">
              <div class="w3-container w3-margin">
                <h2 class="title">Delete Item</h2>
                <h4>Are You Sure Do You Want to Delete This Item?</h4>
                <form action="deleteItem.php" method="post">
                  <input type="hidden" name="itemID" value="<?php echo $row2['id']; ?>">
                  <input type="hidden" name="user" value="<?php echo $row['id']; ?>">
                  <input class="w3-brown w3-btn" type="submit" value="Delete">
                </form>
              </div>
            </div>
            <div class="w3-container w3-light-grey w3-padding">
              <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('deleteItemGeneralInfo').style.display='none'">Close</div>
            </div>
          </div>
        </div>

        <div id="addPrinterModal" class="w3-modal">
          <div class="w3-modal-content w3-animate-top">
            <div id="linkPrinterDiv" class="w3-container" style="height:550px;overflow:auto;background:#f9f9f9;">
              <div class="w3-container w3-margin">
                <h2 class="title">Link Printer</h2>
                <?php
                  $sql11 = "SELECT * FROM `printers`";
                  if(!$result11 = $mysqli->query($sql11)){
                    $mysqli->close();
                    die("queryFailed");
                  }
                  while($row11 = $result11->fetch_assoc()){
                    if(in_array($row11["id"],$printersLinked)){
                      echo "<div class='w3-half w3-padding'><div class='w3-grey w3-padding-small w3-text-light-grey' onclick='unlinkPrinter(".$row11['id'].")'>".$row11['name']."<br><span class='w3-small w3-text-light-grey'>".$row11['location']."<br>".$row11['usedBy']."</span></div></div>";
                      echo "<script>unlinkedPrinters.push(".$row11['id'].");</script>";
                    }else{
                      echo "<div class='w3-half w3-padding'><div id='pri".$row11['id']."' onclick='linkPrinter(".$row11['id'].")' class='w3-card-2 w3-padding-small' style='cursor:pointer;transition:0.3s all;'>".$row11['name']."<br><span class='w3-small w3-text-grey'>".$row11['location']."<br>".$row11['usedBy']."</span><img id='corr".$row11['id']."' style='width:20px;display:none;' class='w3-right' src='correct-mark.png' /></div></div>";
                    }
                  }
                ?>
              </div>
            </div>

            <div id="linkPrinterLoading" class="w3-container" style="height:550px;overflow:auto;display:none;padding-bottom:24px;">
              <h3 class="w3-margin-top w3-center">Loading ...</h3>
            </div>
            <div class="w3-container w3-light-grey w3-padding">
              <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('addPrinterModal').style.display='none'">Close</div>
              <div class="w3-btn w3-right w3-border w3-small w3-margin-right" onclick="unLinkPrintersSubmitted()">Unlink All Printers</div>
              <div id="linkPrinterLink" class="w3-btn w3-right w3-white w3-border w3-small w3-margin-right" onclick="LinkPrintersSubmitted()">Link Printers</div>
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

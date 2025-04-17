        <TabsContent value="elite-dashboard">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-xl font-semibold flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-amber-500" />
                  Elite Broker Control Panel
                </h2>
                <p className="text-muted-foreground">
                  Access exclusive trading tools and premium features
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                <Badge className="bg-amber-500 text-white">
                  <Star className="h-3 w-3 mr-1" /> Elite Member
                </Badge>
                <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
                  Monthly Subscription
                </Badge>
                <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                  Active
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="col-span-1">
                <Card className="bg-primary/5 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Navigation</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      <Button variant="ghost" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Messages
                        <Badge className="ml-auto" variant="destructive">3</Badge>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <Globe className="h-4 w-4 mr-2" />
                        Active Tenders
                        <Badge className="ml-auto">12</Badge>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <FileCheck className="h-4 w-4 mr-2" />
                        My Bids
                        <Badge className="ml-auto">4</Badge>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <Building className="h-4 w-4 mr-2" />
                        Company Directory
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Market Reports
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        Trade Calendar
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Elite Support
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="col-span-1 lg:col-span-3 space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Active Tender Opportunities</CardTitle>
                    <CardDescription>
                      Premium oil shipment tenders available for elite brokers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card className="bg-white/90 hover:shadow-md transition-shadow border-amber-100">
                          <CardHeader className="p-4 pb-2">
                            <Badge className="mb-2 bg-amber-100 text-amber-800 hover:bg-amber-100">
                              Premium
                            </Badge>
                            <CardTitle className="text-base">Saudi Aramco Tender #SA-42187</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="text-sm space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Cargo:</span>
                                <span className="font-medium">Crude Oil</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Quantity:</span>
                                <span className="font-medium">450,000 barrels</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Loading Port:</span>
                                <span className="font-medium">Ras Tanura</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Delivery Window:</span>
                                <span className="font-medium">Jun 15-25, 2025</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Closing Date:</span>
                                <span className="font-medium text-red-600">Apr 21, 2025</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <FileText className="h-3 w-3 mr-2" />
                              Details
                            </Button>
                            <Button size="sm" className="flex-1">
                              <ArrowUpRight className="h-3 w-3 mr-2" />
                              Place Bid
                            </Button>
                          </CardFooter>
                        </Card>
                        
                        <Card className="bg-white/90 hover:shadow-md transition-shadow border-amber-100">
                          <CardHeader className="p-4 pb-2">
                            <Badge className="mb-2 bg-green-100 text-green-800 hover:bg-green-100">
                              New
                            </Badge>
                            <CardTitle className="text-base">ADNOC Tender #AD-2254</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="text-sm space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Cargo:</span>
                                <span className="font-medium">Murban Crude</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Quantity:</span>
                                <span className="font-medium">250,000 barrels</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Loading Port:</span>
                                <span className="font-medium">Jebel Dhanna</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Delivery Window:</span>
                                <span className="font-medium">May 20-30, 2025</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Closing Date:</span>
                                <span className="font-medium text-red-600">Apr 25, 2025</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <FileText className="h-3 w-3 mr-2" />
                              Details
                            </Button>
                            <Button size="sm" className="flex-1">
                              <ArrowUpRight className="h-3 w-3 mr-2" />
                              Place Bid
                            </Button>
                          </CardFooter>
                        </Card>
                        
                        <Card className="bg-white/90 hover:shadow-md transition-shadow border-amber-100">
                          <CardHeader className="p-4 pb-2">
                            <Badge className="mb-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                              Exclusive
                            </Badge>
                            <CardTitle className="text-base">Rosneft Tender #RN-9856</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="text-sm space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Cargo:</span>
                                <span className="font-medium">ESPO Blend</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Quantity:</span>
                                <span className="font-medium">100,000 tonnes</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Loading Port:</span>
                                <span className="font-medium">Kozmino</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Delivery Window:</span>
                                <span className="font-medium">Jul 1-10, 2025</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Closing Date:</span>
                                <span className="font-medium text-red-600">Apr 30, 2025</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <FileText className="h-3 w-3 mr-2" />
                              Details
                            </Button>
                            <Button size="sm" className="flex-1">
                              <ArrowUpRight className="h-3 w-3 mr-2" />
                              Place Bid
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button variant="outline">
                          <Globe className="h-4 w-4 mr-2" />
                          View All Tenders (12)
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                        Recent Messages
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-md">
                          <Avatar>
                            <AvatarFallback className="bg-primary/20">RA</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">Rosatom Energy Trading</p>
                              <Badge variant="destructive">New</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              We have received your offer for the North Sea crude delivery and would like to discuss terms...
                            </p>
                            <p className="text-xs text-gray-500">Today, 10:32 AM</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-md">
                          <Avatar>
                            <AvatarFallback className="bg-primary/20">SA</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">Saudi Aramco</p>
                              <Badge variant="destructive">New</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              Your bid for tender #SA-42187 is under review. Please provide vessel documentation...
                            </p>
                            <p className="text-xs text-gray-500">Yesterday, 3:45 PM</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-md">
                          <Avatar>
                            <AvatarFallback className="bg-primary/20">BP</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">BP Trading</p>
                              <Badge variant="destructive">New</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              Confirming receipt of your proposal. Our team will analyze the terms and get back...
                            </p>
                            <p className="text-xs text-gray-500">Apr 15, 2025</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Button>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Open Inbox
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                        Market Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">Crude Oil Price</h4>
                            <Badge className="bg-green-500">+2.3%</Badge>
                          </div>
                          <div className="h-[60px] bg-gray-100 rounded-md overflow-hidden relative">
                            <div className="absolute inset-0 flex items-end">
                              <div className="h-[40%] w-[10%] bg-gray-300"></div>
                              <div className="h-[45%] w-[10%] bg-gray-300"></div>
                              <div className="h-[35%] w-[10%] bg-gray-300"></div>
                              <div className="h-[50%] w-[10%] bg-gray-300"></div>
                              <div className="h-[48%] w-[10%] bg-gray-300"></div>
                              <div className="h-[42%] w-[10%] bg-gray-300"></div>
                              <div className="h-[60%] w-[10%] bg-green-300"></div>
                              <div className="h-[65%] w-[10%] bg-green-400"></div>
                              <div className="h-[75%] w-[10%] bg-green-500"></div>
                              <div className="h-[80%] w-[10%] bg-green-600"></div>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Apr 10</span>
                            <span>Apr 17</span>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <h4 className="text-sm font-medium mb-2">Premium Market Reports</h4>
                          <div className="space-y-2">
                            <div className="flex items-center p-2 bg-gray-50 rounded-md">
                              <FileText className="h-4 w-4 mr-2 text-primary" />
                              <div className="flex-1">
                                <p className="text-sm">Asia-Pacific Demand Forecast Q2 2025</p>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center p-2 bg-gray-50 rounded-md">
                              <FileText className="h-4 w-4 mr-2 text-primary" />
                              <div className="flex-1">
                                <p className="text-sm">OPEC+ Output Strategy Analysis</p>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center p-2 bg-gray-50 rounded-md">
                              <FileText className="h-4 w-4 mr-2 text-primary" />
                              <div className="flex-1">
                                <p className="text-sm">Vessel Availability Report - April 2025</p>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Button>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View All Reports
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
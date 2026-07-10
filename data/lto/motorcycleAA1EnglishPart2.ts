import { Question } from '../../types/quiz';

type Row = [string, number, string, string, string];
const rows: Row[] = [
  ['After turning right into a one-way street, which lane should you choose?', 0, 'Stay on the rightmost lane', 'Stay on the leftmost lane', 'Stay in the middle lane'],
  ["A person with a disability can possess a driver's license if:", 2, 'They only drive during day hours', 'They are accompanied by a non-disabled person', 'The driving conditions are indicated on the driver’s license'],
  ['What is the meaning of this traffic sign? (Red circle with 60)', 1, 'Minimum speed is 60 km per hour', 'Speed limit in this area is 60 km per hour', 'Distance to next city is 60 km'],
  ['LTO registers roadworthy vehicles, puts order on roads, and:', 1, 'Builds public road infrastructure', 'Licenses quality drivers', 'Provides emergency towing services'],
  ["What is the maximum penalty for a habitual violator of RA 10666?", 2, 'A fine of 10,000 pesos', '1 month imprisonment', "Revocation of driver's license"],
  ['What does this sign mean? (Red circle with a horizontal white bar)', 1, 'No parking', 'No entry', 'No overtaking'],
  ['Changing lanes at an intersection is:', 1, 'Safe if done quickly', 'Unsafe', 'Allowed if there are no traffic enforcers'],
  ['Parking is allowed if the vehicle is:', 1, 'Left directly in front of an entrance', 'Beyond 4 meters of a fire hydrant', 'Within 2 meters of an intersection corner'],
  ['What does this traffic sign mean? (Cross sign icon)', 2, 'Hospital zone ahead', 'Approach to intersection', 'Railroad crossing'],
  ['When is it permissible to use a mobile phone while driving?', 2, 'When traffic is moving slowly', 'When using an earphone at high volume', 'None of the above'],
  ['What should you do if a traffic police officer directs you through a red light or stop sign?', 1, 'Ignore the officer and wait for green', 'You must obey', 'Stop and argue with the officer'],
  ['What is the meaning of a red traffic light?', 0, 'Stop before the stop line', 'Slow down and proceed with caution', 'Stop only if there is crossing traffic'],
  ['Why is it more dangerous to turn left than turn right?', 1, 'Left turns require more steering effort', 'Vehicles from opposite directions are faster', 'Your view to the left is always blocked'],
  ['A driver must not park or stop beside a stop sign when within:', 1, '2 meters', '6 meters', '10 meters'],
  ['What does this sign mean? (No Parking, Mon-Fri)', 0, 'No parking from Monday to Friday', 'Parking is allowed only on weekdays', 'No stopping during peak rush hours'],
  ['Double broken white lines mean:', 1, 'No overtaking allowed', 'You may overtake if there is no danger', 'Dedicated PUV lane only'],
  ['Who is responsible for not overloading a vehicle?', 1, 'The passenger riding pillion', 'The driver or rider', 'The LTO checkpoint enforcer'],
  ['What does this traffic sign mean? (T-junction)', 1, 'Two-way traffic ahead', 'Approach to intersection side road', 'Dead end ahead'],
  ['You can overtake on a highway with two lanes marked by:', 1, 'Solid yellow lines', 'Broken white lines', 'Double solid white lines'],
  ['What should you do if you feel sleepy while driving?', 1, 'Increase speed to reach home faster', 'Park at a rest stop and rest', 'Turn the radio volume very high'],
  ['What does this traffic sign mean? (60 in a black circle with diagonal lines)', 0, 'End of maximum speed limit', 'End of minimum speed', 'No vehicles over 60 tons'],
  ['A Temporary Operator’s Permit authorizes driving for not more than:', 2, '24 hours', '48 hours', '72 hours'],
  ['Road rage is especially likely when a driver experiences:', 1, 'A smooth ride on a clear highway', 'Heavy traffic or gridlock', 'Light rain'],
  ['What does this traffic sign mean? (Car on an incline)', 0, 'Steep descent downhill', 'Uphill course', 'Low-clearance bridge'],
  ['You may drive over a pathway:', 1, 'To bypass heavy traffic', 'To get into a property', 'To park on the sidewalk'],
  ['What must you do at a stop sign?', 1, 'Slow down and clear the area quickly', 'Stop and proceed only when safe', 'Blow your horn'],
  ['A blue traffic sign says 60 kph. What should you do?', 1, 'Drive at a maximum of 60 kph', 'Drive at a minimum of 60 kph', 'Maintain exactly 60 kph'],
  ['What should you do when the brake lights ahead activate?', 0, 'Prepare to brake', 'Shift to a higher gear', 'Turn on hazard lights'],
  ['Where should you position your vehicle before turning left into a minor road?', 1, 'Rightmost part of the road', 'Leftmost part of the road', 'Straddling the center line'],
  ['What do double white lines mean?', 0, 'They separate lanes moving in the same direction', 'They separate opposite traffic', 'They mark parking spaces'],
  ['Where should you install a saddlebag or box?', 1, 'Above handlebar level', 'Not higher than the rider’s seat', 'Past the rear tire bumper line'],
  ['A vehicle is considered parked if:', 1, 'It stops briefly to unload a passenger', 'It is at a standstill and the engine is off', 'It stops at a red light'],
  ['What does this traffic sign mean? (Car with wavy skid marks)', 1, 'Winding road ahead', 'Slippery road', 'Rough road surface'],
  ['What is the proper hand signal for a left turn?', 0, 'Left arm straight in a horizontal position', 'Left arm bent upward at 90 degrees', 'Left arm pointing downward'],
  ['A single broken white line on a two-way road means:', 1, 'Overtaking is prohibited', 'It separates traffic moving in opposite directions', 'Pedestrian-only priority zone'],
  ['What does this sign mean? (Red circle with diagonal lines across numbers)', 0, 'End of maximum speed limit', 'Speed limit applies ahead', 'Speed restriction entry zone'],
  ['What should be done first before changing lanes?', 1, 'Check rear-view mirrors only', 'Check traffic ahead and make a signal', 'Swerve into the next gap'],
  ['A No Stopping sign means:', 1, 'You can stop temporarily to load items', 'You cannot stop unless directed by a traffic officer', 'You can stop if the engine overheats'],
  ['What does this traffic sign mean? (Person shoveling)', 1, 'Playground zone ahead', 'Road works', 'Farming area crossway'],
  ['Which sign shape means yield the right of way?', 1, 'Round', 'Inverted triangle', 'Octagonal'],
  ['The choice of speed may depend on:', 2, 'Weather conditions only', 'Time of day or night', 'All of the above, including vehicle roadworthiness and driver skill'],
  ['What does this traffic sign mean? (S-curve pointing right first)', 1, 'Sharp right turn', 'Dangerous right double curve', 'Winding road network entry'],
  ['What is the primary purpose of using a vehicle horn?', 1, 'To greet friends', 'To warn and avoid a road crash', 'To express frustration'],
  ['You will drive after a dinner party. What is the best course of action?', 0, 'Do not drink alcohol at all', 'Drink only light alcohol', 'Drink coffee before driving'],
  ['A traffic enforcer gives a stop signal at a junction. What should you do?', 0, 'Stop at the stop line', 'Creep forward', 'Turn right immediately'],
  ['On a one-way street, you intend to turn left into a minor road. You should:', 1, 'Position in the center lane', 'Keep well to the left', 'Stay on the rightmost lane'],
  ['What should you do at a railroad crossing without warning devices?', 1, 'Speed through', 'Slow down, look both ways, and proceed carefully if clear', 'Blow the horn continuously'],
  ['What does this traffic sign mean? (Sharp curve left)', 1, 'Hairpin curve right', 'Steep left curve', 'Roundabout exit left'],
  ['A vehicle entering a road from a driveway, alley, or private road:', 0, 'Must stop and yield to roadway traffic and pedestrians', 'Has automatic right of way', 'Should blow its horn and proceed'],
  ['When being overtaken by a car, what should you do?', 1, 'Speed up', 'Maintain your current speed', 'Swerve to the shoulder'],
  ['What should you do when you see a green traffic light?', 0, 'Go ahead', 'Stop completely', 'Slow down and check gauges'],
  ['A light changes from green to yellow as you approach. What should you do?', 0, 'Stop before the intersection or stop line', 'Accelerate quickly', 'Stop in the middle of the box junction'],
  ['What must you do at a flashing yellow traffic signal?', 1, 'Stop and wait for a green arrow', 'Drive with caution and treat it as a give way sign', 'Maintain highway speed'],
  ['What does this traffic sign mean? (Straight vertical arrow)', 0, 'One way ahead', 'No entry lane', 'No turns allowed'],
  ['Why is drinking alcohol before driving dangerous?', 0, 'It leads to poor judgment and reflexes', 'It makes a driver more alert', 'It improves night vision'],
  ['To drive on the road, which documents should be ready?', 1, 'Birth certificate and police clearance', 'Valid license, updated registration, and insurance', 'Motorcycle owner handbook'],
  ['What does this traffic sign mean? (Double S-curve, left first)', 1, 'Dangerous right curve ahead', 'Dangerous left double bend', 'Winding road ahead'],
  ['You must not blow the horn unless:', 0, 'A moving vehicle may cause danger', 'You want to pass on a clear highway', 'You are passing outside a quiet school or hospital'],
  ['Someone is waiting at a pedestrian crossing. What should you do?', 1, 'Blow your horn', 'Stop, let them cross, and wait patiently', 'Speed up before they step down'],
  ['What does this traffic sign mean? (Red circle border with a number)', 1, 'Distance tracker indicator', 'Speed limit or speed restriction', 'Vehicle axle load limit'],
];

export const motorcycleAA1EnglishPart2: Question[] = rows.map(([question, correctIndex, ...options]) => ({ question, options, correctIndex, explanation: `Correct answer: ${options[correctIndex]}.`, difficulty: 'Medium' }));

motorcycleAA1EnglishPart2[0].image = '/images/follow_right_onewaytraffic.webp';
motorcycleAA1EnglishPart2[2].image = '/images/Maximum speed limit.webp';
motorcycleAA1EnglishPart2[5].image = '/images/no_entry.webp';
motorcycleAA1EnglishPart2[20].image = '/images/end of speed limit.webp';
motorcycleAA1EnglishPart2[23].image = '/images/Philippines-Warning-Sign-Warning-for-a-steep-descent.webp';
motorcycleAA1EnglishPart2[26].image = '/images/Minimum speed limit.webp';
motorcycleAA1EnglishPart2[32].image = '/images/Philippines-Warning-Sign-Warning-for-a-slippery-road-surface.webp';
motorcycleAA1EnglishPart2[37].image = '/images/No stopping.webp';
motorcycleAA1EnglishPart2[39].image = '/images/giveway_sign.webp';
motorcycleAA1EnglishPart2[41].image = '/images/Philippines-Warning-Sign-Warning-for-a-double-curve--first-right-then-left.webp';
motorcycleAA1EnglishPart2[47].image = '/images/Philippines-Warning-Sign-Warning-for-a-sharp-curve-to-the-left.webp';
motorcycleAA1EnglishPart2[53].image = '/images/straight_on_only.webp';
motorcycleAA1EnglishPart2[56].image = '/images/Philippines-Warning-Sign-Warning-for-a-double-curve--first-left-then-right.webp';
motorcycleAA1EnglishPart2[59].image = '/images/Maximum speed limit.webp';
